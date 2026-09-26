import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { TemplatesModule } from '../templates/templates.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
    imports: [AiModule, TemplatesModule],
    controllers: [ChatController],
    providers: [ChatService],
})
export class ChatModule {}
