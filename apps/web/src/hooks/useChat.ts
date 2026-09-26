import { create } from 'zustand';

import type {
    AiOptions,
    ChatContext,
    ChatMessage,
    ConversationSummary,
} from '@/utils/api';
import {
    createConversation,
    deleteConversation,
    errorMessage,
    getConversation,
    listConversations,
    renameConversation,
    resetConversation,
    sendChatMessage,
} from '@/utils/api';

export type { ChatContext, ChatMessage, ConversationSummary };

/**
 * Chat state. Conversations and messages live on the server (ChatGPT-style
 * history); only the open conversation id and the generation options are
 * remembered locally.
 */
interface ChatState {
    conversations: ConversationSummary[];
    activeId: string | null;
    messages: ChatMessage[];
    /** The brief, DSL and applied instructions the next edit starts from. */
    context: ChatContext | null;
    loading: boolean;
    pending: boolean;
    error: string | null;
    showHistory: boolean;
    options: AiOptions;

    loadConversations: (q?: string) => Promise<void>;
    open: (id: string) => Promise<void>;
    newChat: () => Promise<void>;
    send: (text: string) => Promise<void>;
    rename: (id: string, title: string) => Promise<void>;
    remove: (id: string) => Promise<void>;
    rate: (messageId: string, rating: 1 | -1) => void;
    resetContext: () => Promise<void>;
    setOptions: (options: Partial<AiOptions>) => void;
    setShowHistory: (show: boolean) => void;
}

const STORAGE_KEY = 'email-template-builder:chat:v2';
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

const summaryOf = (
    detail: ConversationSummary & { messages?: unknown[] },
): ConversationSummary => ({
    id: detail.id,
    title: detail.title,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    messageCount: detail.messageCount,
    preview: detail.preview,
});

const upsert = (
    list: ConversationSummary[],
    item: ConversationSummary,
): ConversationSummary[] =>
    [item, ...list.filter((c) => c.id !== item.id)].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
    );

export const useChat = create<ChatState>((set, get) => ({
    ...load(),
    conversations: [],
    messages: [],
    context: null,
    loading: false,
    pending: false,
    error: null,
    showHistory: false,

    loadConversations: async (q) => {
        try {
            set({ conversations: await listConversations(q), error: null });
        } catch (error) {
            set({ error: errorMessage(error) });
        }
    },

    open: async (id) => {
        set({ loading: true, activeId: id, showHistory: false });
        try {
            const detail = await getConversation(id);
            set({
                messages: detail.messages,
                context: detail.context,
                loading: false,
                error: null,
                conversations: upsert(get().conversations, summaryOf(detail)),
            });
        } catch (error) {
            set({
                loading: false,
                activeId: null,
                messages: [],
                context: null,
                error: errorMessage(error),
            });
        }
    },

    newChat: async () => {
        // Reuse an open, still-empty chat instead of piling up blank ones.
        const { activeId, messages } = get();
        if (activeId && messages.length === 0) {
            set({ showHistory: false });
            return;
        }
        set({
            activeId: null,
            messages: [],
            context: null,
            showHistory: false,
        });
        try {
            const detail = await createConversation();
            set({
                activeId: detail.id,
                conversations: upsert(get().conversations, summaryOf(detail)),
                error: null,
            });
        } catch (error) {
            set({ error: errorMessage(error) });
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
                set({
                    activeId: id,
                    messages: [],
                    context: null,
                    conversations: upsert(
                        get().conversations,
                        summaryOf(detail),
                    ),
                });
            }
            const optimistic: ChatMessage = {
                id: `local-${Date.now()}`,
                role: 'user',
                text,
                createdAt: new Date().toISOString(),
            };
            set((s) => ({ messages: [...s.messages, optimistic] }));
            const result = await sendChatMessage(id, text, get().options);
            if (get().activeId !== id) return; // user switched chats meanwhile
            set((s) => ({
                messages: [
                    ...s.messages.filter((m) => m.id !== optimistic.id),
                    result.user,
                    result.assistant,
                ],
                context: result.conversation.context,
                conversations: upsert(
                    s.conversations,
                    summaryOf(result.conversation),
                ),
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

    rename: async (id, title) => {
        try {
            const summary = await renameConversation(id, title);
            set((s) => ({ conversations: upsert(s.conversations, summary) }));
        } catch (error) {
            set({ error: errorMessage(error) });
        }
    },

    remove: async (id) => {
        try {
            await deleteConversation(id);
            set((s) => ({
                conversations: s.conversations.filter((c) => c.id !== id),
                ...(s.activeId === id
                    ? { activeId: null, messages: [], context: null }
                    : {}),
            }));
        } catch (error) {
            set({ error: errorMessage(error) });
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

    setShowHistory: (showHistory) => set({ showHistory }),
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
