import { GEMINI_MODEL, modelStatus } from './ai.ts';
import { createApp } from './app.ts';

// Node 22 can read a .env file natively; ignore when it does not exist.
try {
    process.loadEnvFile('.env');
} catch {
    // no .env, environment variables only
}

const port = Number(process.env.PORT ?? 8787);
const app = createApp();

app.listen(port, async () => {
    // eslint-disable-next-line no-console
    console.log(`email builder server listening on http://localhost:${port}`);
    const status = await modelStatus();
    if (status.ok) {
        // eslint-disable-next-line no-console
        console.log(`AI: Gemini (${GEMINI_MODEL})`);
    } else {
        // eslint-disable-next-line no-console
        console.log(
            [
                'AI: rules engine (GEMINI_API_KEY is not set).',
                '    Put GEMINI_API_KEY=... in apps/server/.env to generate with Gemini;',
                `    GEMINI_MODEL overrides the model (default ${GEMINI_MODEL}).`,
            ].join('\n'),
        );
    }
});
