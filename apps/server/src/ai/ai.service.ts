import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import type { CanvasNode } from '@email-builder/shared/types';
import { exportHtml, normalizeNode } from '@email-builder/shared/utils';

import { newId } from '../common/ids';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TemplatesService } from '../templates/templates.service';
import { dslToTree, parseDsl } from './engine/dsl';
import { generateDsl, type GenerateOptions, withHistory } from './engine/generator';
import {
    ANSWER_INSTRUCTION,
    GENERATE_SCHEMA,
    INTENT_INSTRUCTION,
    INTENT_SCHEMA,
    REFINE_SCHEMA,
    SUBJECTS_INSTRUCTION,
    SUBJECTS_SCHEMA,
    SYSTEM_INSTRUCTION,
    TITLE_INSTRUCTION,
    answerPrompt,
    cleanDsl,
    generatePrompt,
    intentPrompt,
    refinePrompt,
    subjectsPrompt,
} from './engine/prompts';
import { refineDsl } from './engine/refine';
import { suggestSubjects } from './engine/subjects';
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
    /** The designer's note to the client: structure and creative decisions. */
    summary: string;
    /** Library templates shown to Gemini as structure references. */
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

export type IntentKind = 'generate' | 'refine' | 'subjects' | 'search' | 'answer';

export interface Intent {
    kind: IntentKind;
    query: string;
    engine: Engine;
}

interface GenerateJson {
    dsl?: string;
    summary?: string;
}

interface RefineJson extends GenerateJson {
    changes?: string[];
}

const toRoot = (dsl: string): CanvasNode => normalizeNode(dslToTree(parseDsl(dsl))) as CanvasNode;

/** A model answer must at least parse into one row to be trusted. */
const usable = (dsl: string): boolean => parseDsl(dsl).rows.length > 0;

const lines = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter((v): v is string => typeof v === 'string' && v.trim() !== '').map((v) => v.trim())
        : [];

/**
 * The AI behind the chat: Gemini acts as a senior email designer (structured
 * JSON answers with a rationale, library templates as references), and the
 * rules engine steps in whenever Gemini is missing or fails, so the product
 * always answers.
 */
@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(GeminiService) private readonly gemini: GeminiService,
        @Inject(TemplatesService) private readonly templates: TemplatesService,
    ) {}

    status() {
        return this.gemini.enabled
            ? { ok: true, engine: 'gemini' as const, model: this.gemini.model }
            : { ok: true, engine: 'rules' as const, model: null };
    }

    /* ---------- generation ---------- */

    async generate(
        prompt: string,
        options: GenerateOptions,
        history: string[],
        conversationId?: string,
    ): Promise<GenerationResponse> {
        const effective = withHistory(prompt, options, history);
        const examples = this.gemini.enabled ? await this.templates.examplesFor(prompt, 2) : [];
        const answer = await this.gemini.json<GenerateJson>(
            SYSTEM_INSTRUCTION,
            generatePrompt(
                prompt,
                effective,
                history,
                examples.map((e) => ({ name: e.name, dsl: e.dsl })),
            ),
            GENERATE_SCHEMA,
            0.8,
        );
        const fromModel = answer?.dsl ? cleanDsl(answer.dsl) : null;
        let dsl: string;
        let engine: Engine;
        let summary: string;
        if (fromModel && usable(fromModel)) {
            dsl = fromModel;
            engine = 'gemini';
            summary =
                answer?.summary?.trim() || 'Here is a first draft. Tell me what to change, or apply it to the editor.';
        } else {
            if (fromModel) this.logger.warn('Gemini answer did not parse as DSL; using the rules engine');
            dsl = generateDsl(prompt, effective);
            engine = 'rules';
            summary =
                'Here is a first draft from the built-in engine. Tell me what to change, or apply it to the editor.';
        }
        const root = toRoot(dsl);
        const id = await this.remember({
            prompt,
            options: { ...effective, history },
            dsl,
            root,
            engine,
            conversationId,
        });
        return {
            id,
            name: String(root.properties.title),
            engine,
            model: engine === 'gemini' ? this.gemini.model : null,
            dsl,
            root,
            html: exportHtml(root),
            summary,
            references: engine === 'gemini' ? examples.map((e) => ({ id: e.id, name: e.name })) : [],
        };
    }

    async refine(
        prompt: string,
        dsl: string,
        instruction: string,
        options: GenerateOptions,
        history: string[],
        conversationId?: string,
    ): Promise<RefinementResponse> {
        const effective = withHistory(instruction, options, [prompt, ...history]);
        const answer = await this.gemini.json<RefineJson>(
            SYSTEM_INSTRUCTION,
            refinePrompt(prompt, dsl, instruction, history),
            REFINE_SCHEMA,
            0.4,
        );
        const fromModel = answer?.dsl ? cleanDsl(answer.dsl) : null;
        let next: { dsl: string; engine: Engine; applied: string[]; summary: string };
        if (fromModel && usable(fromModel) && fromModel !== dsl) {
            const changes = lines(answer?.changes);
            next = {
                dsl: fromModel,
                engine: 'gemini',
                applied: changes.length > 0 ? changes : [`Applied: ${instruction}`],
                summary: answer?.summary?.trim() || 'Updated the template.',
            };
        } else {
            const result = refineDsl(dsl, instruction, { prompt, options: effective });
            next = {
                dsl: result.dsl,
                engine: 'rules',
                applied: result.applied,
                summary: result.applied.length > 0 ? `${result.applied.join('. ')}.` : 'Updated the template.',
            };
        }
        const root = toRoot(next.dsl);
        const id = await this.remember({
            prompt: `${prompt}\n→ ${instruction}`,
            options: { ...effective, refine: true, instruction, history },
            dsl: next.dsl,
            root,
            engine: next.engine,
            conversationId,
        });
        return {
            id,
            name: String(root.properties.title),
            engine: next.engine,
            model: next.engine === 'gemini' ? this.gemini.model : null,
            dsl: next.dsl,
            root,
            html: exportHtml(root),
            summary: next.summary,
            references: [],
            applied: next.applied,
        };
    }

    async subjects(prompt: string, options: GenerateOptions, history: string[]): Promise<SubjectIdeas> {
        const effective = withHistory(prompt, options, history);
        const brief = history.length > 0 ? `${history.join('. ')}. ${prompt}` : prompt;
        const fallback: SubjectIdeas = { ...suggestSubjects(brief, effective), engine: 'rules' };
        const ideas = await this.gemini.json<{ subjects?: unknown; preheaders?: unknown }>(
            SUBJECTS_INSTRUCTION,
            subjectsPrompt(prompt, effective, history),
            SUBJECTS_SCHEMA,
            0.9,
        );
        const subjects = lines(ideas?.subjects);
        return subjects.length > 0
            ? { subjects, preheaders: lines(ideas?.preheaders), type: fallback.type, engine: 'gemini' }
            : fallback;
    }

    /* ---------- conversation helpers ---------- */

    /** What a chat message asks for; Gemini decides, heuristics when it is off. */
    async classify(
        text: string,
        hasContext: boolean,
        fallback: () => { kind: IntentKind; query: string },
    ): Promise<Intent> {
        const decided = await this.gemini.json<{ intent?: string; query?: string }>(
            INTENT_INSTRUCTION,
            intentPrompt(text, hasContext),
            INTENT_SCHEMA,
            0,
        );
        const kinds: IntentKind[] = ['generate', 'refine', 'subjects', 'search', 'answer'];
        if (decided?.intent && kinds.includes(decided.intent as IntentKind)) {
            let kind = decided.intent as IntentKind;
            if (kind === 'refine' && !hasContext) kind = 'generate';
            return { kind, query: (decided.query ?? '').trim(), engine: 'gemini' };
        }
        return { ...fallback(), engine: 'rules' };
    }

    /** A consultant-style reply to a question that needs no template. */
    async answer(text: string, context: { prompt: string; dsl: string } | null, history: string[]): Promise<string> {
        const reply = await this.gemini.text(ANSWER_INSTRUCTION, answerPrompt(text, context, history), 0.6, 2048);
        return (
            reply ??
            'I can design emails from a brief, refine the one in the editor, and suggest subject lines. Describe the email you need and I will draft it.'
        );
    }

    /** A short conversation title for the history list. */
    async title(text: string): Promise<string | null> {
        // Thinking models spend output tokens before the answer; keep the budget generous.
        const reply = await this.gemini.text(TITLE_INSTRUCTION, text, 0.3, 512);
        const title = reply
            ?.replace(/^["“']+|["”']+$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return title && title.length <= 80 ? title : null;
    }

    /* ---------- misc ---------- */

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
        conversationId?: string;
    }): Promise<string> {
        const id = newId();
        await this.prisma.generation.create({
            data: {
                id,
                conversationId: input.conversationId ?? null,
                prompt: input.prompt,
                options: input.options as Prisma.InputJsonValue,
                dsl: input.dsl,
                root: input.root as unknown as Prisma.InputJsonValue,
                engine: input.engine,
            },
        });
        return id;
    }
}
