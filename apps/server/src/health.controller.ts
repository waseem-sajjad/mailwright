import { Controller, Get, Inject } from '@nestjs/common';

import { AiService } from './ai/ai.service';

@Controller('api/health')
export class HealthController {
    constructor(@Inject(AiService) private readonly ai: AiService) {}

    @Get()
    health() {
        return this.ai.status();
    }
}
