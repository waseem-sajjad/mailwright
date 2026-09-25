import { createApp } from './app.ts';

const port = Number(process.env.PORT ?? 8787);
const app = createApp();

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`email builder server listening on http://localhost:${port}`);
    // eslint-disable-next-line no-console
    console.log(
        process.env.AI_URL
            ? `model service: ${process.env.AI_URL}`
            : 'model service: not configured, using the rules engine',
    );
});
