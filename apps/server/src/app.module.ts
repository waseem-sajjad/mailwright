import { existsSync } from 'node:fs';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AiModule } from './ai/ai.module';
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
        PrismaModule,
        ProvidersModule,
        TemplatesModule,
        AiModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
