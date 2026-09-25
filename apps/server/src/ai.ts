/**
 * AI engines. The server asks the fine-tuned model service first (when
 * AI_URL is set and healthy) and falls back to the rules engine, so the UI
 * works before any model has been trained.
 */
import axios from 'axios';

import type { CanvasNode } from '@/types';
import { normalizeNode } from '@/utils';

import { dslToTree, parseDsl } from './dsl.ts';
import { generateDsl, type GenerateOptions, withHistory } from './generator.ts';
import { repairDsl } from './prompts.ts';
import { refineDsl } from './refine.ts';

export type Engine = 'model' | 'rules';

export interface GenerationResult {
    dsl: string;
    root: CanvasNode;
    engine: Engine;
    model: string | null;
}

/** The Python service (ai/serve.py) defaults to port 8000; AI_URL overrides it. */
export const AI_URL = (process.env.AI_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
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
    if (process.env.AI_URL === 'off') return { ok: false, name: null };
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
    refine?: { dsl: string; instruction: string },
): Promise<string | null> => {
    const status = await modelStatus();
    if (!status.ok) return null;
    try {
        const { data } = await modelClient.post<{ dsl?: string }>('/generate', {
            prompt,
            options,
            mode: refine ? 'refine' : 'generate',
            current: refine?.dsl,
            instruction: refine?.instruction,
        });
        const dsl = data.dsl ? repairDsl(data.dsl) : '';
        return dsl || null;
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

/**
 * `history` holds the earlier prompts of the same chat; they fill in the
 * company, colour, tone and type the new prompt does not state itself.
 */
export const generate = async (
    prompt: string,
    options: GenerateOptions = {},
    history: string[] = [],
): Promise<GenerationResult> => {
    const effective = withHistory(prompt, options, history);
    const fromModel = await askModel(prompt, effective);
    if (fromModel && usable(fromModel)) {
        const status = await modelStatus();
        return {
            dsl: fromModel,
            root: normalizeNode(dslToTree(parseDsl(fromModel))) as CanvasNode,
            engine: 'model',
            model: status.name,
        };
    }
    const dsl = generateDsl(prompt, effective);
    return {
        dsl,
        root: normalizeNode(dslToTree(parseDsl(dsl))) as CanvasNode,
        engine: 'rules',
        model: null,
    };
};

export interface RefineOutcome extends GenerationResult {
    applied: string[];
}

/** Applies a follow-up instruction to an existing DSL document. */
export const refine = async (
    prompt: string,
    dsl: string,
    instruction: string,
    options: GenerateOptions = {},
    history: string[] = [],
): Promise<RefineOutcome> => {
    const effective = withHistory(instruction, options, [prompt, ...history]);
    const fromModel = await askModel(prompt, effective, { dsl, instruction });
    if (fromModel && usable(fromModel) && fromModel !== dsl) {
        const status = await modelStatus();
        return {
            dsl: fromModel,
            root: normalizeNode(dslToTree(parseDsl(fromModel))) as CanvasNode,
            engine: 'model',
            model: status.name,
            applied: ['Updated by the fine-tuned model'],
        };
    }
    const result = refineDsl(dsl, instruction, { prompt, options: effective });
    return {
        dsl: result.dsl,
        root: normalizeNode(dslToTree(parseDsl(result.dsl))) as CanvasNode,
        engine: 'rules',
        model: null,
        applied: result.applied,
    };
};
