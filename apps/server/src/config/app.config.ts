import path from 'node:path';

import { type ConfigType, registerAs } from '@nestjs/config';

/** Typed application settings, read once from the (validated) environment. */
export const appConfig = registerAs('app', () => ({
    port: Number(process.env.PORT ?? 8787),
    databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
    gemini: {
        apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? '',
        model: process.env.GEMINI_MODEL ?? 'models/gemini-3.8-flash',
        timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 60000),
    },
    corsOrigin: (process.env.CORS_ORIGIN ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    trustProxy: process.env.TRUST_PROXY === 'true',
    webDist: process.env.WEB_DIST ?? path.resolve(process.cwd(), '../web/dist'),
}));

export type AppConfig = ConfigType<typeof appConfig>;
