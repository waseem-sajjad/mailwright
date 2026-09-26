import { z } from 'zod';

/** Environment validation (see docs.nestjs.com/techniques/configuration). */
export const envSchema = z
    .object({
        PORT: z.coerce.number().int().positive().optional(),
        DATABASE_URL: z.string().url().optional(),
        GEMINI_API_KEY: z.string().optional(),
        GOOGLE_API_KEY: z.string().optional(),
        GEMINI_MODEL: z.string().min(1).optional(),
        AI_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
        CORS_ORIGIN: z.string().optional(),
        TRUST_PROXY: z.enum(['true', 'false']).optional(),
        WEB_DIST: z.string().optional(),
    })
    .passthrough();

export const validateEnv = (config: Record<string, unknown>): Record<string, unknown> => {
    const result = envSchema.safeParse(config);
    if (!result.success) {
        const issue = result.error.issues[0];
        throw new Error(`Invalid environment: ${issue.path.join('.')} ${issue.message}`);
    }
    return result.data;
};
