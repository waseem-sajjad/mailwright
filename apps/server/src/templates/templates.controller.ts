import { Controller, Get, Header, Inject, Param, Query, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';

import { exportHtml, forceColorScheme } from '@mailwright/shared/utils';

import { idParam } from '../ai/schemas';
import { ZodValidationPipe } from '../common/zod.pipe';
import { type ListQuery, listQuery } from './schemas';
import { TemplatesService } from './templates.service';

const id = () => new ZodValidationPipe(idParam);

/**
 * Read-only gallery: the site is public, so nothing here writes. Templates come
 * from the seed (see gallery.json). Cheap reads are exempt from rate limits:
 * the gallery renders 20+ thumbnails per open.
 */
@SkipThrottle()
@Controller('api/templates')
export class TemplatesController {
    constructor(@Inject(TemplatesService) private readonly templates: TemplatesService) {}

    /** `?q=` searches name, prompt and DSL by keyword. */
    @Get()
    list(@Query(new ZodValidationPipe(listQuery)) query: ListQuery) {
        return this.templates.list(query);
    }

    @Get(':id')
    get(@Param('id', id()) templateId: string) {
        return this.templates.get(templateId);
    }

    @Get(':id/screenshot')
    @Header('cache-control', 'public, max-age=60')
    async screenshot(@Param('id', id()) templateId: string, @Res() res: Response) {
        const shot = await this.templates.screenshot(templateId);
        res.type(shot.type).send(shot.bytes);
    }

    /** `?scheme=light|dark` pins the colour scheme (thumbnails); otherwise the inbox decides. */
    @Get(':id/html')
    async html(
        @Param('id', id()) templateId: string,
        @Query('scheme') scheme: string | undefined,
        @Res() res: Response,
    ) {
        const row = await this.templates.get(templateId);
        const html = exportHtml(row.root);
        res.type('html').send(scheme === 'light' || scheme === 'dark' ? forceColorScheme(html, scheme) : html);
    }
}
