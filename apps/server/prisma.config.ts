import { defineConfig } from 'prisma/config';

// Node 22 reads .env natively; ignore when it does not exist.
try {
    process.loadEnvFile('.env');
} catch {
    // environment variables only
}

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: { path: 'prisma/migrations' },
    datasource: {
        url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
    },
});
