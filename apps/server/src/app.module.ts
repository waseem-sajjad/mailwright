import { existsSync } from 'node:fs';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AiModule } from './ai/ai.module';
import { ChatModule } from './chat/chat.module';
import { ProvidersModule } from './ai/providers.module';
import { type AppConfig, appConfig } from './config/app.config';
import { validateEnv } from './config/env.validation';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [appConfig], validate: validateEnv, envFilePath: ['.env'] }),
        // Serves the built web app (single-process deploy); API routes stay with the controllers.
        ServeStaticModule.forRootAsync({
            inject: [appConfig.KEY],
            useFactory: (config: AppConfig) =>
                existsSync(config.webDist) ? [{ rootPath: config.webDist, exclude: ['/api/{*path}'] }] : [],
        }),
        // Public site: 300 requests/min per IP by default; AI routes override this to 20 per
        // 10 minutes (@Throttle), read-only gallery and health routes opt out (@SkipThrottle).
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
        PrismaModule,
        ProvidersModule,
        TemplatesModule,
        AiModule,
        ChatModule,
    ],
    controllers: [HealthController],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
