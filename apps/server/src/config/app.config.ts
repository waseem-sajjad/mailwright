import path from 'node:path';

import { type ConfigType, registerAs } from '@nestjs/config';

/** Typed application settings, read once from the (validated) environment. */
export const appConfig = registerAs('app', () => ({
    port: Number(process.env.PORT ?? 8787),
    databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
    gemini: {
        apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '',
        model: process.env.GEMINI_MODEL ?? 'models/gemini-3.8-flash',
        embeddingModel: process.env.GEMINI_EMBEDDING_MODEL ?? 'gemini-embedding-001',
        timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 60000),
    },
    embeddings: {
        /** ollama (local, default) | gemini | off */
        provider: (process.env.EMBEDDINGS_PROVIDER ?? 'ollama') as 'ollama' | 'gemini' | 'off',
        ollamaUrl: (process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434').replace(/\/$/, ''),
        ollamaModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text:latest',
    },
    corsOrigin: (process.env.CORS_ORIGIN ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    webDist: process.env.WEB_DIST ?? path.resolve(process.cwd(), '../web/dist'),
}));

export type AppConfig = ConfigType<typeof appConfig>;
