/**
 * AI engines. With GEMINI_API_KEY set the server asks Gemini (via
 * @google/genai) and falls back to the rules engine on any failure, so the UI
 * works without a key as well.
 */
import { GoogleGenAI, Type } from '@google/genai';

import type { CanvasNode } from '@/types';
import { normalizeNode } from '@/utils';

import { dslToTree, parseDsl } from './dsl.ts';
import { generateDsl, type GenerateOptions, withHistory } from './generator.ts';
import { cleanDsl, generatePrompt, refinePrompt, subjectsPrompt, SYSTEM_INSTRUCTION } from './prompts.ts';
import { refineDsl } from './refine.ts';
import { suggestSubjects } from './subjects.ts';

export type Engine = 'gemini' | 'rules';

export interface GenerationResult {
    dsl: string;
    root: CanvasNode;
    engine: Engine;
    model: string | null;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'models/gemini-3.8-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '';
const AI_TIMEOUT = Number(process.env.AI_TIMEOUT_MS ?? 60000);

const client = GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: GEMINI_API_KEY, httpOptions: { timeout: AI_TIMEOUT } })
    : null;

/** Whether Gemini is configured; the UI shows this in the chat header. */
export const modelStatus = async (): Promise<{ ok: boolean; name: string | null }> =>
    client ? { ok: true, name: GEMINI_MODEL } : { ok: false, name: null };

const warn = (message: string): void => {
    // eslint-disable-next-line no-console
    console.warn(`gemini: ${message}; using the rules engine`);
};

const askGemini = async (contents: string, temperature: number): Promise<string | null> => {
    if (!client) return null;
    try {
        const response = await client.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature,
                maxOutputTokens: 4096,
            },
        });
        const text = response.text?.trim();
        return text ? cleanDsl(text) : null;
    } catch (error) {
        warn(error instanceof Error ? error.message : String(error));
        return null;
    }
};

const toRoot = (dsl: string): CanvasNode => normalizeNode(dslToTree(parseDsl(dsl))) as CanvasNode;

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
    const fromModel = await askGemini(generatePrompt(prompt, effective, history), 0.9);
    if (fromModel && usable(fromModel)) {
        return { dsl: fromModel, root: toRoot(fromModel), engine: 'gemini', model: GEMINI_MODEL };
    }
    if (fromModel) warn('answer did not parse as DSL');
    const dsl = generateDsl(prompt, effective);
    return { dsl, root: toRoot(dsl), engine: 'rules', model: null };
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
    const fromModel = await askGemini(refinePrompt(prompt, dsl, instruction, history), 0.4);
    if (fromModel && usable(fromModel) && fromModel !== dsl) {
        return {
            dsl: fromModel,
            root: toRoot(fromModel),
            engine: 'gemini',
            model: GEMINI_MODEL,
            applied: [`Applied “${instruction}”`],
        };
    }
    const result = refineDsl(dsl, instruction, { prompt, options: effective });
    return {
        dsl: result.dsl,
        root: toRoot(result.dsl),
        engine: 'rules',
        model: null,
        applied: result.applied,
    };
};

export interface SubjectIdeas {
    subjects: string[];
    preheaders: string[];
    type: string;
    engine: Engine;
}

/** Subject line and preheader ideas; Gemini answers as JSON, rules otherwise. */
export const subjects = async (
    prompt: string,
    options: GenerateOptions = {},
    history: string[] = [],
): Promise<SubjectIdeas> => {
    const effective = withHistory(prompt, options, history);
    const brief = history.length > 0 ? `${history.join('. ')}. ${prompt}` : prompt;
    const fallback = { ...suggestSubjects(brief, effective), engine: 'rules' as const };
    if (!client) return fallback;
    try {
        const response = await client.models.generateContent({
            model: GEMINI_MODEL,
            contents: subjectsPrompt(prompt, effective, history),
            config: {
                systemInstruction:
                    'You write concise, specific email subject lines and preheaders. Answer with JSON only.',
                temperature: 0.9,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                        preheaders: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['subjects', 'preheaders'],
                },
            },
        });
        const parsed = JSON.parse(response.text ?? '{}') as Partial<SubjectIdeas>;
        const lines = (value: unknown): string[] =>
            Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.trim() !== '') : [];
        const ideas = { subjects: lines(parsed.subjects), preheaders: lines(parsed.preheaders) };
        if (ideas.subjects.length === 0) return fallback;
        return { ...ideas, type: fallback.type, engine: 'gemini' };
    } catch (error) {
        warn(error instanceof Error ? error.message : String(error));
        return fallback;
    }
};
