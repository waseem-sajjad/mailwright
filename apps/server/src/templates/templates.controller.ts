import { Body, Controller, Delete, Get, Header, HttpCode, Inject, Param, Post, Put, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

import { exportHtml } from '@email-builder/shared/utils';

import { idParam } from '../ai/schemas';
import { ZodValidationPipe } from '../common/zod.pipe';
import {
    type ListQuery,
    type TemplateCreateBody,
    type TemplateUpdateBody,
    listQuery,
    templateCreateBody,
    templateUpdateBody,
} from './schemas';
import { TemplatesService } from './templates.service';

const id = () => new ZodValidationPipe(idParam);

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

    @Get(':id/html')
    async html(@Param('id', id()) templateId: string, @Res() res: Response) {
        const row = await this.templates.get(templateId);
        res.type('html').send(exportHtml(row.root));
    }

    @Post()
    create(@Body(new ZodValidationPipe(templateCreateBody)) body: TemplateCreateBody) {
        return this.templates.create(body);
    }

    @Put(':id')
    update(
        @Param('id', id()) templateId: string,
        @Body(new ZodValidationPipe(templateUpdateBody)) body: TemplateUpdateBody,
    ) {
        return this.templates.update(templateId, body);
    }

    @Post(':id/duplicate')
    duplicate(@Param('id', id()) templateId: string) {
        return this.templates.duplicate(templateId);
    }

    @Delete(':id')
    @HttpCode(200)
    async remove(@Param('id', id()) templateId: string) {
        return { ok: await this.templates.remove(templateId) };
    }
}
