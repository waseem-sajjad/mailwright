import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import type { CanvasNode } from '@email-builder/shared/types';
import { exportHtml, normalizeNode } from '@email-builder/shared/utils';

import { newId } from '../common/ids';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TemplatesService } from '../templates/templates.service';
import { dslToTree, parseDsl } from './engine/dsl';
import { generateDsl, type GenerateOptions, withHistory } from './engine/generator';
import { cleanDsl, generatePrompt, refinePrompt, subjectsPrompt, SYSTEM_INSTRUCTION } from './engine/prompts';
import { refineDsl } from './engine/refine';
import { suggestSubjects } from './engine/subjects';
import { EmbeddingsService } from './embeddings.service';
import { GeminiService } from './gemini.service';

export type Engine = 'gemini' | 'rules';

export interface Reference {
    id: string;
    name: string;
}

export interface GenerationResponse {
    id: string;
    name: string;
    engine: Engine;
    model: string | null;
    dsl: string;
    root: CanvasNode;
    html: string;
    /** Library templates pgvector found similar to the brief and showed to Gemini. */
    references: Reference[];
}

export interface RefinementResponse extends GenerationResponse {
    applied: string[];
}

export interface SubjectIdeas {
    subjects: string[];
    preheaders: string[];
    type: string;
    engine: Engine;
}

const toRoot = (dsl: string): CanvasNode => normalizeNode(dslToTree(parseDsl(dsl))) as CanvasNode;

/** A model answer must at least parse into one row to be trusted. */
const usable = (dsl: string): boolean => parseDsl(dsl).rows.length > 0;

/**
 * Generation, refinement and subject ideas: Gemini first (with the library
 * templates pgvector finds closest to the brief as few-shot context), rules
 * engine otherwise. Every result is stored in `generations` with the
 * embedding of its prompt.
 */
@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(GeminiService) private readonly gemini: GeminiService,
        @Inject(EmbeddingsService) private readonly embeddings: EmbeddingsService,
        @Inject(TemplatesService) private readonly templates: TemplatesService,
    ) {}

    status() {
        const embeddings = this.embeddings.info();
        return this.gemini.enabled
            ? { ok: true, engine: 'gemini' as const, model: this.gemini.model, embeddings }
            : { ok: true, engine: 'rules' as const, model: null, embeddings };
    }

    async generate(prompt: string, options: GenerateOptions, history: string[]): Promise<GenerationResponse> {
        const effective = withHistory(prompt, options, history);
        const embedding = await this.embeddings.embed(prompt, 'RETRIEVAL_QUERY');
        const examples = embedding ? await this.templates.similarByVector(embedding, 2, { withDsl: true }) : [];
        const answer = await this.gemini.text(
            SYSTEM_INSTRUCTION,
            generatePrompt(
                prompt,
                effective,
                history,
                examples.map((e) => ({ name: e.name, dsl: e.dsl ?? '' })),
            ),
            0.9,
        );
        const fromModel = answer ? cleanDsl(answer) : null;
        let dsl: string;
        let engine: Engine;
        if (fromModel && usable(fromModel)) {
            dsl = fromModel;
            engine = 'gemini';
        } else {
            if (fromModel) this.logger.warn('Gemini answer did not parse as DSL; using the rules engine');
            dsl = generateDsl(prompt, effective);
            engine = 'rules';
        }
        const root = toRoot(dsl);
        const id = await this.remember({ prompt, options: { ...effective, history }, dsl, root, engine, embedding });
        return {
            id,
            name: String(root.properties.title),
            engine,
            model: engine === 'gemini' ? this.gemini.model : null,
            dsl,
            root,
            html: exportHtml(root),
            references: examples.map((e) => ({ id: e.id, name: e.name })),
        };
    }

    async refine(
        prompt: string,
        dsl: string,
        instruction: string,
        options: GenerateOptions,
        history: string[],
    ): Promise<RefinementResponse> {
        const effective = withHistory(instruction, options, [prompt, ...history]);
        const answer = await this.gemini.text(SYSTEM_INSTRUCTION, refinePrompt(prompt, dsl, instruction, history), 0.4);
        const fromModel = answer ? cleanDsl(answer) : null;
        let next: { dsl: string; engine: Engine; applied: string[] };
        if (fromModel && usable(fromModel) && fromModel !== dsl) {
            next = { dsl: fromModel, engine: 'gemini', applied: [`Applied “${instruction}”`] };
        } else {
            const result = refineDsl(dsl, instruction, { prompt, options: effective });
            next = { dsl: result.dsl, engine: 'rules', applied: result.applied };
        }
        const root = toRoot(next.dsl);
        const id = await this.remember({
            prompt: `${prompt}\n→ ${instruction}`,
            options: { ...effective, refine: true, instruction, history },
            dsl: next.dsl,
            root,
            engine: next.engine,
            embedding: await this.embeddings.embed(`${prompt}. ${instruction}`, 'RETRIEVAL_DOCUMENT'),
        });
        return {
            id,
            name: String(root.properties.title),
            engine: next.engine,
            model: next.engine === 'gemini' ? this.gemini.model : null,
            dsl: next.dsl,
            root,
            html: exportHtml(root),
            references: [],
            applied: next.applied,
        };
    }

    async subjects(prompt: string, options: GenerateOptions, history: string[]): Promise<SubjectIdeas> {
        const effective = withHistory(prompt, options, history);
        const brief = history.length > 0 ? `${history.join('. ')}. ${prompt}` : prompt;
        const fallback: SubjectIdeas = { ...suggestSubjects(brief, effective), engine: 'rules' };
        const ideas = await this.gemini.subjectIdeas(subjectsPrompt(prompt, effective, history));
        return ideas ? { ...ideas, type: fallback.type, engine: 'gemini' } : fallback;
    }

    /** Re-expands edited DSL without calling the model. */
    expand(dsl: string): { root: CanvasNode; html: string; name: string } {
        const root = toRoot(dsl);
        return { root, html: exportHtml(root), name: String(root.properties.title) };
    }

    rules(prompt: string, options: GenerateOptions): { dsl: string } {
        return { dsl: generateDsl(prompt, options) };
    }

    async rate(id: string, rating: number): Promise<boolean> {
        const result = await this.prisma.generation.updateMany({
            where: { id },
            data: { rating: Math.max(-1, Math.min(1, Math.round(rating))) },
        });
        return result.count > 0;
    }

    async history(limit = 50) {
        const rows = await this.prisma.generation.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: { id: true, prompt: true, options: true, dsl: true, engine: true, rating: true, createdAt: true },
        });
        return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
    }

    async historyItem(id: string) {
        const row = await this.prisma.generation.findUnique({ where: { id } });
        if (!row) throw new NotFoundException('not found');
        const root = row.root as unknown as CanvasNode;
        return { ...row, root, createdAt: row.createdAt.toISOString(), html: exportHtml(root) };
    }

    private async remember(input: {
        prompt: string;
        options: Record<string, unknown>;
        dsl: string;
        root: CanvasNode;
        engine: Engine;
        embedding: number[] | null;
    }): Promise<string> {
        const id = newId();
        await this.prisma.generation.create({
            data: {
                id,
                prompt: input.prompt,
                options: input.options as Prisma.InputJsonValue,
                dsl: input.dsl,
                root: input.root as unknown as Prisma.InputJsonValue,
                engine: input.engine,
            },
        });
        if (input.embedding) {
            await this.prisma
                .$executeRaw`UPDATE generations SET embedding = ${JSON.stringify(input.embedding)}::vector WHERE id = ${id}`;
        }
        return id;
    }
}
