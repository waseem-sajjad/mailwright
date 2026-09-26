import { Body, Controller, Inject, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

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
    refineBody,
    subjectsBody,
} from './schemas';

/** Model calls are rate limited per IP (see AppModule) because the site is public. */
@Throttle({ ai: { limit: 20, ttl: 600_000 } })
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
}
