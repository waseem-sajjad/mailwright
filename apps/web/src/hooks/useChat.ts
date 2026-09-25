import { create } from 'zustand';

import type { CanvasNode } from '@/types';
import type { AiOptions, Generation, SubjectIdeas } from '@/utils/api';
import { aiGenerate, aiRefine, aiSubjects, errorMessage } from '@/utils/api';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    createdAt: string;
    /** A generated or refined template attached to an assistant reply. */
    generation?: Generation & { applied?: string[]; rating?: 1 | -1 | 0 };
    subjects?: SubjectIdeas;
    error?: boolean;
}

interface ChatState {
    messages: ChatMessage[];
    pending: boolean;
    options: AiOptions;
    /** The brief and DSL that follow-up instructions refine. */
    context: { prompt: string; dsl: string } | null;

    setOptions: (options: Partial<AiOptions>) => void;
    send: (text: string) => Promise<void>;
    rate: (messageId: string, rating: 1 | -1) => void;
    clear: () => void;
}

const STORAGE_KEY = 'email-template-builder:chat';
const newId = () => Math.random().toString(36).slice(2, 10);
const stamp = () => new Date().toISOString();

const load = (): Pick<ChatState, 'messages' | 'context' | 'options'> => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) throw new Error('empty');
        const parsed = JSON.parse(raw) as Pick<
            ChatState,
            'messages' | 'context' | 'options'
        >;
        return {
            messages: Array.isArray(parsed.messages) ? parsed.messages : [],
            context: parsed.context ?? null,
            options: parsed.options ?? { type: 'auto', tone: 'auto' },
        };
    } catch {
        return {
            messages: [],
            context: null,
            options: { type: 'auto', tone: 'auto' },
        };
    }
};

const isRefinement = (text: string): boolean =>
    /^(make|change|set|add|insert|remove|delete|drop|use|switch|turn|replace|shorten|shorter|more|less|without|update|rename|put)\b/i.test(
        text.trim(),
    ) ||
    /\b(it|this|the (header|hero|button|heading|title|coupon|footer|tone|colou?r))\b/i.test(
        text,
    );

const wantsSubjects = (text: string): boolean =>
    /\b(subject( line)?s?|preheaders?)\b/i.test(text) &&
    /\b(suggest|ideas?|give|write|options|some|what|need)\b/i.test(text);

export const useChat = create<ChatState>((set, get) => ({
    ...load(),
    pending: false,

    setOptions: (options) =>
        set((s) => ({ options: { ...s.options, ...options } })),

    send: async (raw) => {
        const text = raw.trim();
        if (!text || get().pending) return;
        const user: ChatMessage = {
            id: newId(),
            role: 'user',
            text,
            createdAt: stamp(),
        };
        set((s) => ({ messages: [...s.messages, user], pending: true }));

        const reply = (
            message: Omit<ChatMessage, 'id' | 'role' | 'createdAt'>,
        ) =>
            set((s) => ({
                messages: [
                    ...s.messages,
                    {
                        id: newId(),
                        role: 'assistant',
                        createdAt: stamp(),
                        ...message,
                    },
                ],
                pending: false,
            }));

        const { context, options } = get();
        try {
            if (wantsSubjects(text)) {
                const brief = context?.prompt
                    ? `${context.prompt}. ${text}`
                    : text;
                const subjects = await aiSubjects(brief, options);
                reply({
                    text: 'Here are some subject lines and preheaders you could use:',
                    subjects,
                });
                return;
            }
            if (context && isRefinement(text)) {
                const result = await aiRefine({
                    prompt: context.prompt,
                    dsl: context.dsl,
                    instruction: text,
                    options,
                });
                set({ context: { prompt: context.prompt, dsl: result.dsl } });
                reply({
                    text:
                        result.applied.length > 0
                            ? result.applied.join('. ')
                            : 'Updated the template.',
                    generation: { ...result, rating: 0 },
                });
                return;
            }
            const generation = await aiGenerate(text, options);
            set({ context: { prompt: text, dsl: generation.dsl } });
            reply({
                text: `Here's a first draft of “${generation.name}”. Tell me what to change, or apply it to the editor.`,
                generation: { ...generation, rating: 0 },
            });
        } catch (error) {
            reply({ text: errorMessage(error), error: true });
        }
    },

    rate: (messageId, rating) =>
        set((s) => ({
            messages: s.messages.map((m) =>
                m.id === messageId && m.generation
                    ? { ...m, generation: { ...m.generation, rating } }
                    : m,
            ),
        })),

    clear: () => set({ messages: [], context: null }),
}));

useChat.subscribe((state) => {
    try {
        // Keep the conversation but not the heavy HTML/root payloads of old turns.
        const messages = state.messages.slice(-30).map((m) =>
            m.generation
                ? {
                      ...m,
                      generation: {
                          ...m.generation,
                          html: '',
                          root: m.generation.root,
                      },
                  }
                : m,
        );
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                messages,
                context: state.context,
                options: state.options,
            }),
        );
    } catch {
        // storage full or unavailable
    }
});

/** Applies a generation to the editor; returns the root so callers can load it. */
export const generationRoot = (message: ChatMessage): CanvasNode | null =>
    message.generation?.root ?? null;
