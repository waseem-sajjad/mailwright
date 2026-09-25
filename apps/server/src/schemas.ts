/** Request validation with zod. Every API body is parsed before use. */
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const emailNode: z.ZodType<{
    id: string;
    type: string;
    properties: Record<string, unknown>;
    children: unknown[];
}> = z.lazy(() =>
    z.object({
        id: z.string().min(1),
        type: z.string().min(1),
        properties: z.record(z.unknown()),
        children: z.array(emailNode),
    }),
);

export const canvasNode = emailNode.refine((node) => node.type === 'Canvas', {
    message: 'root must be a Canvas node',
});

export const generateOptions = z
    .object({
        type: z
            .enum([
                'auto', 'welcome', 'newsletter', 'promo', 'event', 'announcement',
                'abandoned-cart', 'receipt', 'feedback', 're-engagement', 'invite',
            ])
            .optional(),
        tone: z.enum(['auto', 'friendly', 'professional', 'playful', 'urgent']).optional(),
        brand: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'brand must be a hex colour').optional(),
        company: z.string().trim().max(80).optional(),
        seed: z.number().int().nonnegative().optional(),
    })
    .strict();

export const generateBody = z.object({
    prompt: z.string().trim().min(3, 'Describe the email you want in a few words.').max(1000),
    options: generateOptions.default({}),
});

export const refineBody = z.object({
    prompt: z.string().trim().min(1).max(1000),
    dsl: z.string().trim().min(1).max(20000),
    instruction: z.string().trim().min(2, 'Tell me what to change.').max(500),
    options: generateOptions.default({}),
});

export const subjectsBody = z.object({
    prompt: z.string().trim().min(3).max(1000),
    options: generateOptions.default({}),
});

export const expandBody = z.object({
    dsl: z.string().trim().min(1).max(20000),
});

export const feedbackBody = z.object({
    id: z.string().min(1),
    rating: z.number().int().min(-1).max(1),
});

const screenshot = z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, 'screenshot must be a PNG, JPEG or WebP data URL')
    .max(8_000_000);

export const templateCreateBody = z.object({
    name: z.string().trim().max(120).optional(),
    root: canvasNode,
    prompt: z.string().trim().max(1000).optional(),
    screenshot: screenshot.optional(),
});

export const templateUpdateBody = z
    .object({
        name: z.string().trim().min(1).max(120).optional(),
        root: canvasNode.optional(),
        screenshot: screenshot.nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: 'nothing to update' });

export const idParam = z.object({ id: z.string().regex(/^[\w-]{4,32}$/) });

export type GenerateBody = z.infer<typeof generateBody>;
export type RefineBody = z.infer<typeof refineBody>;
export type TemplateCreateBody = z.infer<typeof templateCreateBody>;
export type TemplateUpdateBody = z.infer<typeof templateUpdateBody>;

/** Express middleware: parses `req.body` (or params) and replaces it with the typed value. */
export const validate =
    <T extends z.ZodTypeAny>(schema: T, source: 'body' | 'params' = 'body') =>
    (req: Request, res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            res.status(400).json({
                error: result.error.issues[0]?.message ?? 'invalid request',
                issues: result.error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                })),
            });
            return;
        }
        if (source === 'body') req.body = result.data;
        else Object.assign(req.params, result.data);
        next();
    };
