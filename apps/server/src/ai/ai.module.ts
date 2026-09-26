import { Module } from '@nestjs/common';

import { TemplatesModule } from '../templates/templates.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
    imports: [TemplatesModule],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule {}
