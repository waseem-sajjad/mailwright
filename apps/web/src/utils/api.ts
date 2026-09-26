import axios from 'axios';

import type { CanvasNode } from '@/types';

/** Server API client. Same origin in production; Vite proxies /api in dev. */
export const api = axios.create({
    baseURL: import.meta.env?.VITE_API_URL ?? '',
    timeout: 90000,
});

export interface AiOptions {
    type?: string;
    tone?: string;
    /** "large" asks for 10 to 14 sections instead of 5 to 9. */
    size?: 'standard' | 'large';
    brand?: string;
    company?: string;
}

/** A library template shown to Gemini as a structure reference. */
export interface Reference {
    id: string;
    name: string;
}

export interface Generation {
    id: string;
    name: string;
    engine: 'gemini' | 'rules';
    dsl: string;
    root: CanvasNode;
    html: string;
    references: Reference[];
}

export type TemplateKind = 'starter' | 'user' | 'ai';

export interface CloudTemplate {
    id: string;
    name: string;
    kind: TemplateKind;
    prompt: string | null;
    /** Came with DSL (AI result or large starter), so Gemini can learn from it. */
    hasDsl: boolean;
    screenshot: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Health {
    ok: boolean;
    /** Whether the AI designer is available (vendor and model are never exposed). */
    ai: boolean;
}

export const errorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { error?: string } | undefined;
        if (data?.error) return data.error;
        if (error.code === 'ERR_NETWORK') {
            return 'Cannot reach the server. Start it with `pnpm dev` in apps/server.';
        }
        return error.message;
    }
    return error instanceof Error ? error.message : 'Something went wrong';
};

export const aiHealth = async (): Promise<Health> =>
    (await api.get<Health>('/api/health', { timeout: 5000 })).data;

/** `history`: earlier prompts of the chat, oldest first; they give the engines context. */
export const aiGenerate = async (
    prompt: string,
    options: AiOptions,
    history: string[] = [],
): Promise<Generation> =>
    (
        await api.post<Generation>('/api/ai/generate', {
            prompt,
            options,
            history,
        })
    ).data;

export interface Refinement extends Generation {
    applied: string[];
}

export const aiRefine = async (input: {
    prompt: string;
    dsl: string;
    instruction: string;
    options?: AiOptions;
    history?: string[];
}): Promise<Refinement> =>
    (await api.post<Refinement>('/api/ai/refine', input)).data;

export interface SubjectIdeas {
    subjects: string[];
    preheaders: string[];
    type: string;
    engine?: 'gemini' | 'rules';
}

export const aiSubjects = async (
    prompt: string,
    options: AiOptions = {},
    history: string[] = [],
): Promise<SubjectIdeas> =>
    (
        await api.post<SubjectIdeas>('/api/ai/subjects', {
            prompt,
            options,
            history,
        })
    ).data;

export const aiExpand = async (
    dsl: string,
): Promise<Pick<Generation, 'root' | 'html' | 'name'>> =>
    (await api.post('/api/ai/expand', { dsl })).data;

export const aiFeedback = async (id: string, rating: 1 | -1): Promise<void> => {
    await api.post('/api/ai/feedback', { id, rating });
};

/** `q` searches name, prompt and DSL by keyword. */
export const listCloudTemplates = async (
    params: { q?: string; kind?: TemplateKind; limit?: number } = {},
): Promise<CloudTemplate[]> =>
    (await api.get<CloudTemplate[]>('/api/templates', { params })).data;

export const getCloudTemplate = async (
    id: string,
): Promise<CloudTemplate & { root: CanvasNode }> =>
    (await api.get(`/api/templates/${id}`)).data;

export const templateHtmlUrl = (template: CloudTemplate): string =>
    `${api.defaults.baseURL ?? ''}/api/templates/${template.id}/html?v=${encodeURIComponent(template.updatedAt)}`;

export const screenshotUrl = (template: CloudTemplate): string | null =>
    template.screenshot
        ? `${api.defaults.baseURL ?? ''}${template.screenshot}?v=${encodeURIComponent(template.updatedAt)}`
        : null;

/* ---------- chat conversations (ChatGPT-style history, stored on the server) ---------- */

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

export interface MessageGeneration extends Generation {
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
    templates?: CloudTemplate[];
    error?: boolean;
}

export interface ConversationDetail extends ConversationSummary {
    context: ChatContext | null;
    messages: ChatMessage[];
}

export const createConversation = async (
    title?: string,
): Promise<ConversationDetail> =>
    (await api.post<ConversationDetail>('/api/chat', { title })).data;

export const getConversation = async (
    id: string,
): Promise<ConversationDetail> =>
    (await api.get<ConversationDetail>(`/api/chat/${id}`)).data;

export const deleteConversation = async (id: string): Promise<void> => {
    await api.delete(`/api/chat/${id}`);
};

/** One turn: the server stores the user message, answers it and returns both. */
export const sendChatMessage = async (
    id: string,
    text: string,
    options: AiOptions,
): Promise<{
    user: ChatMessage;
    assistant: ChatMessage;
    conversation: ConversationDetail;
}> => (await api.post(`/api/chat/${id}/messages`, { text, options })).data;

export const resetConversation = async (id: string): Promise<void> => {
    await api.post(`/api/chat/${id}/reset`);
};
