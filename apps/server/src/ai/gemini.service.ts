import { GoogleGenAI, Type } from '@google/genai';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { type AppConfig, appConfig } from '../config/app.config';

export const EMBEDDING_DIMENSIONS = 768;

export type EmbeddingTask = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

/** Thin wrapper around @google/genai: text, JSON and embeddings, all optional. */
@Injectable()
export class GeminiService {
    private readonly logger = new Logger(GeminiService.name);
    private readonly client: GoogleGenAI | null;
    readonly model: string;
    readonly embeddingModel: string;

    constructor(@Inject(appConfig.KEY) config: AppConfig) {
        const { apiKey, model, embeddingModel, timeoutMs } = config.gemini;
        this.model = model;
        this.embeddingModel = embeddingModel;
        this.client = apiKey ? new GoogleGenAI({ apiKey, httpOptions: { timeout: timeoutMs } }) : null;
    }

    get enabled(): boolean {
        return this.client !== null;
    }

    /** Plain-text completion; null when disabled or failing (callers fall back to rules). */
    async text(systemInstruction: string, contents: string, temperature: number): Promise<string | null> {
        if (!this.client) return null;
        try {
            const response = await this.client.models.generateContent({
                model: this.model,
                contents,
                config: { systemInstruction, temperature, maxOutputTokens: 8192 },
            });
            return response.text?.trim() || null;
        } catch (error) {
            this.logger.warn(`generateContent failed: ${(error as Error).message}`);
            return null;
        }
    }

    /** JSON completion constrained to `{ subjects: string[], preheaders: string[] }`. */
    async subjectIdeas(contents: string): Promise<{ subjects: string[]; preheaders: string[] } | null> {
        if (!this.client) return null;
        try {
            const response = await this.client.models.generateContent({
                model: this.model,
                contents,
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
            const parsed = JSON.parse(response.text ?? '{}') as Record<string, unknown>;
            const lines = (value: unknown): string[] =>
                Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.trim() !== '') : [];
            const ideas = { subjects: lines(parsed.subjects), preheaders: lines(parsed.preheaders) };
            return ideas.subjects.length > 0 ? ideas : null;
        } catch (error) {
            this.logger.warn(`subject ideas failed: ${(error as Error).message}`);
            return null;
        }
    }

    /** 768-dimensional embedding for pgvector; null when disabled or failing. */
    async embed(text: string, task: EmbeddingTask): Promise<number[] | null> {
        if (!this.client || !text.trim()) return null;
        try {
            const response = await this.client.models.embedContent({
                model: this.embeddingModel,
                contents: text.slice(0, 8000),
                config: { taskType: task, outputDimensionality: EMBEDDING_DIMENSIONS },
            });
            const values = response.embeddings?.[0]?.values;
            if (!values || values.length !== EMBEDDING_DIMENSIONS) return null;
            // Gemini only normalises 3072-d vectors; cosine distance wants unit length.
            const norm = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0)) || 1;
            return values.map((v) => v / norm);
        } catch (error) {
            this.logger.warn(`embedContent failed: ${(error as Error).message}`);
            return null;
        }
    }
}
