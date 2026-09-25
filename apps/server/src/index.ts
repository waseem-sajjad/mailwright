import { AI_URL, modelStatus } from './ai.ts';
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
        console.log(`AI: fine-tuned model "${status.name}" at ${AI_URL}`);
    } else {
        // eslint-disable-next-line no-console
        console.log(
            [
                `AI: rules engine (no model service answering at ${AI_URL}).`,
                '    To use the fine-tuned model: cd apps/server && python3 ai/pipeline.py',
                '    then: uvicorn ai.serve:app --port 8000   (see ai/README.md)',
                '    The server re-checks every 30 s, no restart needed.',
            ].join('\n'),
        );
    }
});
