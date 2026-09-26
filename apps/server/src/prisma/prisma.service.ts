import { Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { type AppConfig, appConfig } from '../config/app.config';
import { PrismaClient } from '../generated/prisma/client';

/** Prisma 7 client on the pg driver adapter (docs.nestjs.com/recipes/prisma). */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor(@Inject(appConfig.KEY) config: AppConfig) {
        super({ adapter: new PrismaPg({ connectionString: config.databaseUrl }) });
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
        this.logger.log('connected to PostgreSQL');
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}
