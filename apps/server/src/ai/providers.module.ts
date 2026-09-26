import { Global, Module } from '@nestjs/common';

import { EmbeddingsService } from './embeddings.service';
import { GeminiService } from './gemini.service';

/** Gemini (generation) and the embeddings provider, available app-wide. */
@Global()
@Module({
    providers: [GeminiService, EmbeddingsService],
    exports: [GeminiService, EmbeddingsService],
})
export class ProvidersModule {}
