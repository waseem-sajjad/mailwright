import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';

import { ZodValidationPipe } from '../common/zod.pipe';
import { AiService } from './ai.service';
import {
    type ExpandBody,
    type FeedbackBody,
    type GenerateBody,
    type RefineBody,
    type SubjectsBody,
    expandBody,
    feedbackBody,
    generateBody,
    idParam,
    refineBody,
    subjectsBody,
} from './schemas';

@Controller('api/ai')
export class AiController {
    constructor(@Inject(AiService) private readonly ai: AiService) {}

    @Post('generate')
    generate(@Body(new ZodValidationPipe(generateBody)) body: GenerateBody) {
        return this.ai.generate(body.prompt, body.options, body.history);
    }

    /** Follow-up instruction applied to a previous result (chat refinement). */
    @Post('refine')
    refine(@Body(new ZodValidationPipe(refineBody)) body: RefineBody) {
        return this.ai.refine(body.prompt, body.dsl, body.instruction, body.options, body.history);
    }

    @Post('subjects')
    subjects(@Body(new ZodValidationPipe(subjectsBody)) body: SubjectsBody) {
        return this.ai.subjects(body.prompt, body.options, body.history);
    }

    @Post('expand')
    expand(@Body(new ZodValidationPipe(expandBody)) body: ExpandBody) {
        return this.ai.expand(body.dsl);
    }

    /** Rules engine preview without Gemini. */
    @Post('rules')
    rules(@Body(new ZodValidationPipe(generateBody)) body: GenerateBody) {
        return this.ai.rules(body.prompt, body.options);
    }

    @Post('feedback')
    async feedback(@Body(new ZodValidationPipe(feedbackBody)) body: FeedbackBody) {
        return { ok: await this.ai.rate(body.id, body.rating) };
    }

    @Get('history')
    history() {
        return this.ai.history(50);
    }

    @Get('history/:id')
    historyItem(@Param('id', new ZodValidationPipe(idParam)) id: string) {
        return this.ai.historyItem(id);
    }
}
