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
        // Public site: 120 requests/min per IP overall, 20 model calls per 10 min (`ai` bucket).
        ThrottlerModule.forRoot([
            { name: 'default', ttl: 60_000, limit: 120 },
            { name: 'ai', ttl: 600_000, limit: 20 },
        ]),
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
