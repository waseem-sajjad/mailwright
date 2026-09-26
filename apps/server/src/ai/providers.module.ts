import { Global, Module } from '@nestjs/common';

import { GeminiService } from './gemini.service';

/** Gemini client, available app-wide. */
@Global()
@Module({
    providers: [GeminiService],
    exports: [GeminiService],
})
export class ProvidersModule {}
