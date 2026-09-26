import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { idParam } from '../ai/schemas';
import { ZodValidationPipe } from '../common/zod.pipe';
import { ChatService } from './chat.service';
import { type ConversationCreateBody, type SendBody, conversationCreateBody, sendBody } from './schemas';

const id = () => new ZodValidationPipe(idParam);

/** Conversations are private to the browser that created them: there is no listing. */
@Controller('api/chat')
export class ChatController {
    constructor(@Inject(ChatService) private readonly chat: ChatService) {}

    @Post()
    create(@Body(new ZodValidationPipe(conversationCreateBody)) body: ConversationCreateBody) {
        return this.chat.create(body.title);
    }

    @Get(':id')
    get(@Param('id', id()) conversationId: string) {
        return this.chat.get(conversationId);
    }

    @Delete(':id')
    @HttpCode(200)
    async remove(@Param('id', id()) conversationId: string) {
        return { ok: await this.chat.remove(conversationId) };
    }

    /** One turn: stores the user message, answers it, returns both plus the updated conversation. */
    @Throttle({ default: { limit: 20, ttl: 600_000 } })
    @Post(':id/messages')
    send(@Param('id', id()) conversationId: string, @Body(new ZodValidationPipe(sendBody)) body: SendBody) {
        return this.chat.send(conversationId, body.text, body.options);
    }

    @Post(':id/reset')
    async reset(@Param('id', id()) conversationId: string) {
        await this.chat.resetContext(conversationId);
        return { ok: true };
    }
}
