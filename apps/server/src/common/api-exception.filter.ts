import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

/** Every error leaves as `{ error: string, issues?: [...] }`, which the web client reads. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ApiExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();
        if (exception instanceof HttpException) {
            const body = exception.getResponse();
            const payload: Record<string, unknown> =
                typeof body === 'string' ? { error: body } : { ...(body as Record<string, unknown>) };
            if (typeof payload.message === 'string') payload.error = payload.message;
            if (typeof payload.error !== 'string') payload.error = exception.message;
            delete payload.message;
            delete payload.statusCode;
            response.status(exception.getStatus()).json(payload);
            return;
        }
        this.logger.error(exception instanceof Error ? (exception.stack ?? exception.message) : String(exception));
        response.status(500).json({ error: 'internal error' });
    }
}
