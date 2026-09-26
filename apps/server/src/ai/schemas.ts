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
                'auto',
                'welcome',
                'newsletter',
                'promo',
                'event',
                'announcement',
                'abandoned-cart',
                'receipt',
                'feedback',
                're-engagement',
                'invite',
            ])
            .optional(),
        tone: z.enum(['auto', 'friendly', 'professional', 'playful', 'urgent']).optional(),
        size: z.enum(['standard', 'large']).optional(),
        brand: z
            .string()
            .regex(/^#[0-9a-fA-F]{6}$/, 'brand must be a hex colour')
            .optional(),
        company: z.string().trim().max(80).optional(),
        seed: z.number().int().nonnegative().optional(),
    })
    .strict();

/** Earlier prompts of the same chat, oldest first (context for the engines). */
const history = z.array(z.string().trim().min(1).max(1000)).max(10).default([]);

export const generateBody = z.object({
    prompt: z.string().trim().min(3, 'Describe the email you want in a few words.').max(1000),
    options: generateOptions.default({}),
    history,
});

export const refineBody = z.object({
    prompt: z.string().trim().min(1).max(1000),
    dsl: z.string().trim().min(1).max(20000),
    instruction: z.string().trim().min(2, 'Tell me what to change.').max(500),
    options: generateOptions.default({}),
    history,
});

export const subjectsBody = z.object({
    prompt: z.string().trim().min(3).max(1000),
    options: generateOptions.default({}),
    history,
});

export const expandBody = z.object({
    dsl: z.string().trim().min(1).max(20000),
});

export const feedbackBody = z.object({
    id: z.string().min(1),
    rating: z.number().int().min(-1).max(1),
});

export const idParam = z.string().regex(/^[\w-]{4,32}$/, 'invalid id');

export type GenerateBody = z.infer<typeof generateBody>;
export type RefineBody = z.infer<typeof refineBody>;
export type SubjectsBody = z.infer<typeof subjectsBody>;
export type ExpandBody = z.infer<typeof expandBody>;
export type FeedbackBody = z.infer<typeof feedbackBody>;
