import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Query } from '@nestjs/common';

import { idParam } from '../ai/schemas';
import { ZodValidationPipe } from '../common/zod.pipe';
import { ChatService } from './chat.service';
import {
    type ConversationCreateBody,
    type ConversationUpdateBody,
    type ListConversationsQuery,
    type SendBody,
    conversationCreateBody,
    conversationUpdateBody,
    listConversationsQuery,
    sendBody,
} from './schemas';

const id = () => new ZodValidationPipe(idParam);

@Controller('api/chat')
export class ChatController {
    constructor(@Inject(ChatService) private readonly chat: ChatService) {}

    @Get()
    list(@Query(new ZodValidationPipe(listConversationsQuery)) query: ListConversationsQuery) {
        return this.chat.list(query);
    }

    @Post()
    create(@Body(new ZodValidationPipe(conversationCreateBody)) body: ConversationCreateBody) {
        return this.chat.create(body.title);
    }

    @Get(':id')
    get(@Param('id', id()) conversationId: string) {
        return this.chat.get(conversationId);
    }

    @Patch(':id')
    rename(
        @Param('id', id()) conversationId: string,
        @Body(new ZodValidationPipe(conversationUpdateBody)) body: ConversationUpdateBody,
    ) {
        return this.chat.rename(conversationId, body.title);
    }

    @Delete(':id')
    @HttpCode(200)
    async remove(@Param('id', id()) conversationId: string) {
        return { ok: await this.chat.remove(conversationId) };
    }

    /** One turn: stores the user message, answers it, returns both plus the updated conversation. */
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
