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
    brand?: string;
    company?: string;
}

export interface Generation {
    id: string;
    name: string;
    engine: 'model' | 'rules';
    model: string | null;
    dsl: string;
    root: CanvasNode;
    html: string;
}

export interface HistoryItem {
    id: string;
    prompt: string;
    engine: string;
    rating: number;
    createdAt: string;
}

export interface CloudTemplate {
    id: string;
    name: string;
    prompt: string | null;
    screenshot: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Health {
    ok: boolean;
    engine: 'model' | 'rules';
    model: string | null;
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

export const aiGenerate = async (
    prompt: string,
    options: AiOptions,
): Promise<Generation> =>
    (await api.post<Generation>('/api/ai/generate', { prompt, options })).data;

export const aiExpand = async (
    dsl: string,
): Promise<Pick<Generation, 'root' | 'html' | 'name'>> =>
    (await api.post('/api/ai/expand', { dsl })).data;

export const aiFeedback = async (id: string, rating: 1 | -1): Promise<void> => {
    await api.post('/api/ai/feedback', { id, rating });
};

export const aiHistory = async (): Promise<HistoryItem[]> =>
    (await api.get<HistoryItem[]>('/api/ai/history')).data;

export const aiHistoryItem = async (
    id: string,
): Promise<Generation & { prompt: string }> =>
    (await api.get(`/api/ai/history/${id}`)).data;

export const listCloudTemplates = async (): Promise<CloudTemplate[]> =>
    (await api.get<CloudTemplate[]>('/api/templates')).data;

export const getCloudTemplate = async (
    id: string,
): Promise<CloudTemplate & { root: CanvasNode }> =>
    (await api.get(`/api/templates/${id}`)).data;

export const saveCloudTemplate = async (input: {
    name: string;
    root: CanvasNode;
    prompt?: string;
    screenshot?: string;
}): Promise<CloudTemplate> =>
    (await api.post<CloudTemplate>('/api/templates', input)).data;

export const deleteCloudTemplate = async (id: string): Promise<void> => {
    await api.delete(`/api/templates/${id}`);
};

export const screenshotUrl = (template: CloudTemplate): string | null =>
    template.screenshot
        ? `${api.defaults.baseURL ?? ''}${template.screenshot}?v=${encodeURIComponent(template.updatedAt)}`
        : null;
