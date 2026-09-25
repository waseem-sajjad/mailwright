/**
 * AI engines. The server asks the fine-tuned model service first (when
 * AI_URL is set and healthy) and falls back to the rules engine, so the UI
 * works before any model has been trained.
 */
import axios from 'axios';

import type { CanvasNode } from '@/types';
import { normalizeNode } from '@/utils';

import { dslToTree, parseDsl } from './dsl.ts';
import { generateDsl, type GenerateOptions } from './generator.ts';

export type Engine = 'model' | 'rules';

export interface GenerationResult {
    dsl: string;
    root: CanvasNode;
    engine: Engine;
    model: string | null;
}

const AI_URL = process.env.AI_URL ?? '';
const AI_TIMEOUT = Number(process.env.AI_TIMEOUT_MS ?? 60000);

/** Client for the Python model service (ai/serve.py). */
const modelClient = axios.create({
    baseURL: AI_URL,
    timeout: AI_TIMEOUT,
    headers: { 'content-type': 'application/json' },
});

let modelInfo: { name: string | null; checkedAt: number; ok: boolean } | null = null;

/** Cached health probe of the Python model service. */
export const modelStatus = async (): Promise<{ ok: boolean; name: string | null }> => {
    if (!AI_URL) return { ok: false, name: null };
    if (modelInfo && Date.now() - modelInfo.checkedAt < 30000) {
        return { ok: modelInfo.ok, name: modelInfo.name };
    }
    try {
        const { data } = await modelClient.get<{ model?: string }>('/health', {
            timeout: 3000,
        });
        modelInfo = { name: data.model ?? 'model', checkedAt: Date.now(), ok: true };
    } catch {
        modelInfo = { name: null, checkedAt: Date.now(), ok: false };
    }
    return { ok: modelInfo.ok, name: modelInfo.name };
};

const askModel = async (
    prompt: string,
    options: GenerateOptions,
): Promise<string | null> => {
    const status = await modelStatus();
    if (!status.ok) return null;
    try {
        const { data } = await modelClient.post<{ dsl?: string }>('/generate', {
            prompt,
            options,
        });
        return data.dsl?.trim() || null;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // eslint-disable-next-line no-console
            console.warn(`model service failed: ${error.message}; using rules engine`);
        }
        return null;
    }
};

/** A model answer must at least parse into one row to be trusted. */
const usable = (dsl: string): boolean => parseDsl(dsl).rows.length > 0;

export const generate = async (
    prompt: string,
    options: GenerateOptions = {},
): Promise<GenerationResult> => {
    const fromModel = await askModel(prompt, options);
    if (fromModel && usable(fromModel)) {
        const status = await modelStatus();
        return {
            dsl: fromModel,
            root: normalizeNode(dslToTree(parseDsl(fromModel))) as CanvasNode,
            engine: 'model',
            model: status.name,
        };
    }
    const dsl = generateDsl(prompt, options);
    return {
        dsl,
        root: normalizeNode(dslToTree(parseDsl(dsl))) as CanvasNode,
        engine: 'rules',
        model: null,
    };
};
