import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodTypeAny, z } from 'zod';

/** Validates a body/param/query against a zod schema and returns the typed value. */
export class ZodValidationPipe<T extends ZodTypeAny> implements PipeTransform<unknown, z.infer<T>> {
    constructor(private readonly schema: T) {}

    transform(value: unknown): z.infer<T> {
        const result = this.schema.safeParse(value);
        if (!result.success) {
            throw new BadRequestException({
                error: result.error.issues[0]?.message ?? 'invalid request',
                issues: result.error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                })),
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result.data as z.infer<T>;
    }
}
