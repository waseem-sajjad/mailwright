import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { GeminiService } from './ai/gemini.service';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { type AppConfig, appConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
    const config = app.get<AppConfig>(appConfig.KEY);
    // Screenshots arrive as data URLs, so allow bodies well above the 100 kB default.
    app.useBodyParser('json', { limit: '12mb' });
    app.useBodyParser('urlencoded', { limit: '1mb', extended: true });
    app.enableCors({ origin: config.corsOrigin.length > 0 ? config.corsOrigin : true });
    app.useGlobalFilters(new ApiExceptionFilter());
    app.enableShutdownHooks();
    await app.listen(config.port);

    const logger = new Logger('bootstrap');
    const gemini = app.get(GeminiService);
    logger.log(`email builder server listening on http://localhost:${config.port}`);
    logger.log(
        gemini.enabled
            ? `AI: Gemini (${gemini.model})`
            : 'AI: rules engine. Put GEMINI_API_KEY=... in apps/server/.env to generate with Gemini.',
    );
}

void bootstrap();
