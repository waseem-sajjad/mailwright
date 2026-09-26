import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { type AppConfig, appConfig } from '../config/app.config';
import { EMBEDDING_DIMENSIONS, type EmbeddingTask, GeminiService } from './gemini.service';

export interface EmbeddingsInfo {
    provider: 'ollama' | 'gemini' | 'off';
    model: string | null;
    ok: boolean;
}

/**
 * Text embeddings for pgvector. Default provider is a local Ollama model
 * (nomic-embed-text, 768 dimensions) so semantic search and "similar
 * templates" work without any API key; Gemini embeddings are the alternative.
 */
@Injectable()
export class EmbeddingsService implements OnModuleInit {
    private readonly logger = new Logger(EmbeddingsService.name);
    private readonly provider: AppConfig['embeddings']['provider'];
    private readonly ollamaUrl: string;
    private readonly ollamaModel: string;
    private ollamaOk = false;

    constructor(
        @Inject(appConfig.KEY) config: AppConfig,
        @Inject(GeminiService) private readonly gemini: GeminiService,
    ) {
        this.provider = config.embeddings.provider;
        this.ollamaUrl = config.embeddings.ollamaUrl;
        this.ollamaModel = config.embeddings.ollamaModel;
    }

    async onModuleInit(): Promise<void> {
        if (this.provider !== 'ollama') return;
        try {
            const response = await fetch(`${this.ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(3000) });
            const data = (await response.json()) as { models?: { name: string }[] };
            const names = (data.models ?? []).map((m) => m.name);
            this.ollamaOk = names.includes(this.ollamaModel) || names.includes(`${this.ollamaModel}:latest`);
            if (!this.ollamaOk) {
                this.logger.warn(
                    `Ollama at ${this.ollamaUrl} has no "${this.ollamaModel}" (run: ollama pull ${this.ollamaModel}); vector search is off`,
                );
            }
        } catch (error) {
            this.logger.warn(
                `Ollama not reachable at ${this.ollamaUrl}: ${(error as Error).message}; vector search is off`,
            );
        }
    }

    get enabled(): boolean {
        if (this.provider === 'ollama') return this.ollamaOk;
        if (this.provider === 'gemini') return this.gemini.enabled;
        return false;
    }

    info(): EmbeddingsInfo {
        if (this.provider === 'ollama') return { provider: 'ollama', model: this.ollamaModel, ok: this.ollamaOk };
        if (this.provider === 'gemini')
            return { provider: 'gemini', model: this.gemini.embeddingModel, ok: this.gemini.enabled };
        return { provider: 'off', model: null, ok: false };
    }

    /** Unit-length 768-d vector, or null when the provider is off or failing. */
    async embed(text: string, task: EmbeddingTask): Promise<number[] | null> {
        if (!this.enabled || !text.trim()) return null;
        if (this.provider === 'gemini') return this.gemini.embed(text, task);
        try {
            // nomic-embed-text is trained with these task prefixes.
            const prefix = task === 'RETRIEVAL_QUERY' ? 'search_query: ' : 'search_document: ';
            const response = await fetch(`${this.ollamaUrl}/api/embed`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ model: this.ollamaModel, input: prefix + text.slice(0, 6000) }),
                signal: AbortSignal.timeout(60000),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = (await response.json()) as { embeddings?: number[][] };
            const values = data.embeddings?.[0];
            if (!values || values.length !== EMBEDDING_DIMENSIONS) {
                throw new Error(`expected ${EMBEDDING_DIMENSIONS} dimensions, got ${values?.length ?? 0}`);
            }
            const norm = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0)) || 1;
            return values.map((v) => v / norm);
        } catch (error) {
            this.logger.warn(`Ollama embedding failed: ${(error as Error).message}`);
            return null;
        }
    }
}
