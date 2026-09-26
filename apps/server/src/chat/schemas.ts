import { z } from 'zod';

import { generateOptions } from '../ai/schemas';

export const conversationCreateBody = z.object({
    title: z.string().trim().min(1).max(120).optional(),
});

export const conversationUpdateBody = z.object({
    title: z.string().trim().min(1).max(120),
});

export const sendBody = z.object({
    text: z.string().trim().min(1, 'Type a message.').max(2000),
    options: generateOptions.default({}),
});

export const listConversationsQuery = z.object({
    q: z.string().trim().max(200).optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100),
});

export type ConversationCreateBody = z.infer<typeof conversationCreateBody>;
export type ConversationUpdateBody = z.infer<typeof conversationUpdateBody>;
export type SendBody = z.infer<typeof sendBody>;
export type ListConversationsQuery = z.infer<typeof listConversationsQuery>;
