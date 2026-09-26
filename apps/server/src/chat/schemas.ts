import { z } from 'zod';

import { generateOptions } from '../ai/schemas';

export const conversationCreateBody = z.object({
    title: z.string().trim().min(1).max(120).optional(),
});

export const sendBody = z.object({
    text: z.string().trim().min(1, 'Type a message.').max(2000),
    options: generateOptions.default({}),
});

export type ConversationCreateBody = z.infer<typeof conversationCreateBody>;
export type SendBody = z.infer<typeof sendBody>;
