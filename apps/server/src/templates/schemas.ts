import { z } from 'zod';

import { canvasNode } from '../ai/schemas';

const screenshot = z
    .string()
    .regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, 'screenshot must be a PNG, JPEG or WebP data URL')
    .max(8_000_000);

export const templateCreateBody = z.object({
    name: z.string().trim().max(120).optional(),
    root: canvasNode,
    prompt: z.string().trim().max(1000).optional(),
    /** Compact DSL when the template came from the AI (used as a Gemini example). */
    dsl: z.string().trim().max(20000).optional(),
    screenshot: screenshot.optional(),
});

export const templateUpdateBody = z
    .object({
        name: z.string().trim().min(1).max(120).optional(),
        root: canvasNode.optional(),
        screenshot: screenshot.nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: 'nothing to update' });

export const listQuery = z.object({
    q: z.string().trim().max(500).optional(),
    kind: z.enum(['starter', 'user', 'ai']).optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100),
});

export type TemplateCreateBody = z.infer<typeof templateCreateBody>;
export type TemplateUpdateBody = z.infer<typeof templateUpdateBody>;
export type ListQuery = z.infer<typeof listQuery>;
