import { create } from 'zustand';

import type { AiOptions, ChatContext, ChatMessage } from '@/utils/api';
import {
    createConversation,
    deleteConversation,
    errorMessage,
    getConversation,
    resetConversation,
    sendChatMessage,
} from '@/utils/api';

export type { ChatContext, ChatMessage };

/**
 * Chat state for a public site: one private conversation per browser. The
 * server stores the turns (so refinements keep their context) but never
 * lists conversations; only this browser knows the id.
 */
interface ChatState {
    activeId: string | null;
    messages: ChatMessage[];
    /** The brief, DSL and applied instructions the next edit starts from. */
    context: ChatContext | null;
    loading: boolean;
    pending: boolean;
    error: string | null;
    options: AiOptions;

    /** Reloads the remembered conversation after a page load. */
    restore: () => Promise<void>;
    /** Deletes the current conversation on the server and starts an empty one. */
    newChat: () => Promise<void>;
    send: (text: string) => Promise<void>;
    rate: (messageId: string, rating: 1 | -1) => void;
    resetContext: () => Promise<void>;
    setOptions: (options: Partial<AiOptions>) => void;
}

const STORAGE_KEY = 'mailwright:chat:v2';
const DEFAULT_OPTIONS: AiOptions = {
    type: 'auto',
    tone: 'auto',
    size: 'standard',
};

const load = (): { activeId: string | null; options: AiOptions } => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) throw new Error('empty');
        const parsed = JSON.parse(raw) as {
            activeId?: string | null;
            options?: AiOptions;
        };
        return {
            activeId: parsed.activeId ?? null,
            options: { ...DEFAULT_OPTIONS, ...parsed.options },
        };
    } catch {
        return { activeId: null, options: DEFAULT_OPTIONS };
    }
};

export const useChat = create<ChatState>((set, get) => ({
    ...load(),
    messages: [],
    context: null,
    loading: false,
    pending: false,
    error: null,

    restore: async () => {
        const id = get().activeId;
        if (!id) return;
        set({ loading: true });
        try {
            const detail = await getConversation(id);
            set({
                messages: detail.messages,
                context: detail.context,
                loading: false,
                error: null,
            });
        } catch {
            // Gone on the server (or a different server): start fresh silently.
            set({
                loading: false,
                activeId: null,
                messages: [],
                context: null,
            });
        }
    },

    newChat: async () => {
        const { activeId, messages } = get();
        if (activeId && messages.length === 0) return;
        set({ activeId: null, messages: [], context: null, error: null });
        if (activeId) {
            try {
                await deleteConversation(activeId);
            } catch {
                // nothing to clean up
            }
        }
    },

    send: async (raw) => {
        const text = raw.trim();
        if (!text || get().pending) return;
        let id = get().activeId;
        set({ pending: true, error: null });
        try {
            if (!id) {
                const detail = await createConversation();
                id = detail.id;
                set({ activeId: id, messages: [], context: null });
            }
            const optimistic: ChatMessage = {
                id: `local-${Date.now()}`,
                role: 'user',
                text,
                createdAt: new Date().toISOString(),
            };
            set((s) => ({ messages: [...s.messages, optimistic] }));
            const result = await sendChatMessage(id, text, get().options);
            if (get().activeId !== id) return;
            set((s) => ({
                messages: [
                    ...s.messages.filter((m) => m.id !== optimistic.id),
                    result.user,
                    result.assistant,
                ],
                context: result.conversation.context,
                pending: false,
            }));
        } catch (error) {
            set((s) => ({
                pending: false,
                messages: s.messages.filter((m) => !m.id.startsWith('local-')),
                error: errorMessage(error),
            }));
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

    resetContext: async () => {
        const id = get().activeId;
        if (!id) return;
        set({ context: null });
        try {
            await resetConversation(id);
        } catch (error) {
            set({ error: errorMessage(error) });
        }
    },

    setOptions: (options) =>
        set((s) => ({ options: { ...s.options, ...options } })),
}));

useChat.subscribe((state) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                activeId: state.activeId,
                options: state.options,
            }),
        );
    } catch {
        // storage full or unavailable
    }
});
