import { GoogleGenAI, type Schema } from '@google/genai';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { type AppConfig, appConfig } from '../config/app.config';

/** Thin wrapper around @google/genai: text and structured JSON. Every call degrades to null. */
@Injectable()
export class GeminiService {
    private readonly logger = new Logger(GeminiService.name);
    private readonly client: GoogleGenAI | null;
    readonly model: string;

    constructor(@Inject(appConfig.KEY) config: AppConfig) {
        const { apiKey, model, timeoutMs } = config.gemini;
        this.model = model;
        this.client = apiKey ? new GoogleGenAI({ apiKey, httpOptions: { timeout: timeoutMs } }) : null;
    }

    get enabled(): boolean {
        return this.client !== null;
    }

    /** Plain-text completion. */
    async text(
        systemInstruction: string,
        contents: string,
        temperature: number,
        maxOutputTokens = 2048,
    ): Promise<string | null> {
        if (!this.client) return null;
        try {
            const response = await this.client.models.generateContent({
                model: this.model,
                contents,
                config: { systemInstruction, temperature, maxOutputTokens },
            });
            return response.text?.trim() || null;
        } catch (error) {
            this.logger.warn(`generateContent failed: ${(error as Error).message}`);
            return null;
        }
    }

    /** Structured completion constrained to `schema`; returns the parsed object. */
    async json<T>(systemInstruction: string, contents: string, schema: Schema, temperature: number): Promise<T | null> {
        if (!this.client) return null;
        try {
            const response = await this.client.models.generateContent({
                model: this.model,
                contents,
                config: {
                    systemInstruction,
                    temperature,
                    maxOutputTokens: 8192,
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                },
            });
            const raw = response.text?.trim();
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch (error) {
            this.logger.warn(`structured generateContent failed: ${(error as Error).message}`);
            return null;
        }
    }
}
