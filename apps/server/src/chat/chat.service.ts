import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import type { CanvasNode } from '@email-builder/shared/types';
import { exportHtml } from '@email-builder/shared/utils';

import { AiService, type Engine, type Reference, type SubjectIdeas } from '../ai/ai.service';
import type { GenerateOptions } from '../ai/engine/generator';
import { newId } from '../common/ids';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { type TemplateSummary, TemplatesService } from '../templates/templates.service';
import { classify as heuristicIntent } from './intent';

/** The brief, the current DSL and the applied instructions the next edit starts from. */
export interface ChatContext {
    prompt: string;
    dsl: string;
    steps: string[];
}

export interface ConversationSummary {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
    preview: string | null;
}

export interface ConversationDetail extends ConversationSummary {
    context: ChatContext | null;
    messages: ChatMessage[];
}

export interface MessageGeneration {
    id: string;
    name: string;
    engine: Engine;
    dsl: string;
    root: CanvasNode;
    html: string;
    references: Reference[];
    applied: string[];
    rating: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    createdAt: string;
    generation?: MessageGeneration;
    subjects?: SubjectIdeas;
    templates?: TemplateSummary[];
    error?: boolean;
}

interface Payload {
    subjects?: SubjectIdeas;
    templates?: TemplateSummary[];
    applied?: string[];
    references?: Reference[];
}

const HISTORY_LIMIT = 8;
const TITLE_LIMIT = 60;

/** Conversations: every turn is stored and the server keeps the template context. No listing: chats are private to the browser that holds the id. */
@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Inject(AiService) private readonly ai: AiService,
        @Inject(TemplatesService) private readonly templates: TemplatesService,
    ) {}

    /* ---------- conversations ---------- */

    async create(title?: string): Promise<ConversationDetail> {
        const id = newId();
        await this.prisma.conversation.create({ data: { id, title: title ?? 'New chat' } });
        return this.get(id);
    }

    async get(id: string): Promise<ConversationDetail> {
        const row = await this.prisma.conversation.findUnique({
            where: { id },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!row) throw new NotFoundException('not found');
        const generationIds = row.messages.map((m) => m.generationId).filter((g): g is string => g !== null);
        const generations = new Map(
            (await this.prisma.generation.findMany({ where: { id: { in: generationIds } } })).map((g) => [g.id, g]),
        );
        const messages: ChatMessage[] = row.messages.map((m) => {
            const payload = (m.payload ?? {}) as Payload;
            const message: ChatMessage = {
                id: m.id,
                role: m.role as 'user' | 'assistant',
                text: m.text,
                createdAt: m.createdAt.toISOString(),
            };
            if (m.error) message.error = true;
            if (payload.subjects) message.subjects = payload.subjects;
            if (payload.templates) message.templates = payload.templates;
            const g = m.generationId ? generations.get(m.generationId) : undefined;
            if (g) {
                const root = g.root as unknown as CanvasNode;
                message.generation = {
                    id: g.id,
                    name: String(root.properties.title ?? 'Untitled'),
                    engine: g.engine as Engine,
                    dsl: g.dsl,
                    root,
                    html: exportHtml(root),
                    references: payload.references ?? [],
                    applied: payload.applied ?? [],
                    rating: g.rating,
                };
            }
            return message;
        });
        return {
            id: row.id,
            title: row.title,
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
            messageCount: messages.length,
            preview: messages.at(-1)?.text.slice(0, 120) ?? null,
            context: (row.context as unknown as ChatContext | null) ?? null,
            messages,
        };
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.prisma.conversation.deleteMany({ where: { id } });
        return result.count > 0;
    }

    /** Keeps the messages but starts the next prompt from scratch. */
    async resetContext(id: string): Promise<void> {
        await this.ensure(id);
        await this.prisma.conversation.update({ where: { id }, data: { context: Prisma.DbNull } });
    }

    /* ---------- a turn ---------- */

    async send(
        id: string,
        text: string,
        options: GenerateOptions,
    ): Promise<{ user: ChatMessage; assistant: ChatMessage; conversation: ConversationDetail }> {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id },
            include: { messages: { where: { role: 'user' }, orderBy: { createdAt: 'asc' }, select: { text: true } } },
        });
        if (!conversation) throw new NotFoundException('not found');
        const context = (conversation.context as unknown as ChatContext | null) ?? null;
        const previous = conversation.messages.map((m) => m.text).slice(-HISTORY_LIMIT);

        const user = await this.append(id, { role: 'user', text });
        if (conversation.title === 'New chat' && conversation.messages.length === 0) {
            const title = (await this.ai.title(text)) ?? this.titleFrom(text);
            await this.prisma.conversation.update({ where: { id }, data: { title } });
        }

        let assistant: ChatMessage;
        try {
            assistant = await this.answer(id, text, options, context, previous);
        } catch (error) {
            this.logger.warn(`turn failed: ${(error as Error).message}`);
            assistant = await this.append(id, {
                role: 'assistant',
                text: 'Something went wrong while answering. Please try again.',
                error: true,
            });
        }
        await this.prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
        return { user, assistant, conversation: await this.get(id) };
    }

    private async answer(
        id: string,
        text: string,
        options: GenerateOptions,
        context: ChatContext | null,
        previous: string[],
    ): Promise<ChatMessage> {
        const intent = await this.ai.classify(text, context !== null, () => heuristicIntent(text, context !== null));
        if (intent.kind === 'search') {
            const query = intent.query || (heuristicIntent(text, context !== null).query ?? '');
            const found = await this.templates.list({ q: query || undefined, limit: 6 });
            const plural = found.length === 1 ? '' : 's';
            return this.append(id, {
                role: 'assistant',
                text:
                    found.length > 0
                        ? `Here ${found.length === 1 ? 'is' : 'are'} ${found.length} template${plural} from the library${query ? ` for “${query}”` : ''}:`
                        : `Nothing in the library matches “${query}”.`,
                payload: { templates: found },
            });
        }
        if (intent.kind === 'answer') {
            const reply = await this.ai.answer(text, context, previous);
            return this.append(id, { role: 'assistant', text: reply });
        }
        if (intent.kind === 'subjects') {
            const subjects = await this.ai.subjects(
                text,
                options,
                context ? [context.prompt, ...context.steps] : previous,
            );
            return this.append(id, {
                role: 'assistant',
                text: 'Here are some subject lines and preheaders you could use:',
                payload: { subjects },
            });
        }
        if (intent.kind === 'refine' && context) {
            const result = await this.ai.refine(
                context.prompt,
                context.dsl,
                text,
                options,
                context.steps.slice(-HISTORY_LIMIT),
                id,
            );
            await this.setContext(id, { prompt: context.prompt, dsl: result.dsl, steps: [...context.steps, text] });
            return this.append(id, {
                role: 'assistant',
                text: result.summary,
                generationId: result.id,
                payload: { applied: result.applied, references: result.references },
            });
        }
        const result = await this.ai.generate(text, options, previous, id);
        await this.setContext(id, { prompt: text, dsl: result.dsl, steps: [] });
        return this.append(id, {
            role: 'assistant',
            text: result.summary,
            generationId: result.id,
            payload: { references: result.references },
        });
    }

    /* ---------- helpers ---------- */

    private async append(
        conversationId: string,
        input: { role: 'user' | 'assistant'; text: string; generationId?: string; payload?: Payload; error?: boolean },
    ): Promise<ChatMessage> {
        const id = newId();
        await this.prisma.message.create({
            data: {
                id,
                conversationId,
                role: input.role,
                text: input.text,
                generationId: input.generationId ?? null,
                payload: input.payload ? (input.payload as unknown as Prisma.InputJsonValue) : Prisma.DbNull,
                error: input.error ?? false,
            },
        });
        const detail = await this.get(conversationId);
        return detail.messages.find((m) => m.id === id) as ChatMessage;
    }

    private async setContext(id: string, context: ChatContext): Promise<void> {
        await this.prisma.conversation.update({
            where: { id },
            data: { context: context as unknown as Prisma.InputJsonValue },
        });
    }

    private async ensure(id: string): Promise<void> {
        const row = await this.prisma.conversation.findUnique({ where: { id }, select: { id: true } });
        if (!row) throw new NotFoundException('not found');
    }

    private titleFrom(text: string): string {
        const clean = text.replace(/\s+/g, ' ').trim();
        return clean.length > TITLE_LIMIT ? `${clean.slice(0, TITLE_LIMIT - 1).trimEnd()}…` : clean;
    }
}
