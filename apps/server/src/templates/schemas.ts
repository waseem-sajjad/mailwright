import { z } from 'zod';

export const listQuery = z.object({
    q: z.string().trim().max(500).optional(),
    kind: z.enum(['starter', 'user', 'ai']).optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100),
});

export type ListQuery = z.infer<typeof listQuery>;
