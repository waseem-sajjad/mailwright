import { existsSync } from 'node:fs';
import path from 'node:path';

import cors from 'cors';
import express, { type Request, type Response } from 'express';

import type { CanvasNode } from '@/types';
import { exportHtml, normalizeNode } from '@/utils';

import { generate, modelStatus } from './ai.ts';
import { generations, templates } from './db.ts';
import { generateDsl } from './generator.ts';
import { removeScreenshot, saveScreenshot, screenshotFile } from './screenshot.ts';
import { dslToTree, parseDsl } from './dsl.ts';
import {
    expandBody,
    feedbackBody,
    generateBody,
    idParam,
    templateCreateBody,
    templateUpdateBody,
    validate,
    type GenerateBody,
    type TemplateCreateBody,
    type TemplateUpdateBody,
} from './schemas.ts';

/** Express 5 types params as string | string[]; ids are validated as strings. */
const paramId = (req: Request): string => String(req.params.id);

export const createApp = () => {
    const app = express();
    app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
    app.use(express.json({ limit: '25mb' }));

    /* ---------- health ---------- */
    app.get('/api/health', async (_req, res) => {
        const model = await modelStatus();
        res.json({
            ok: true,
            engine: model.ok ? 'model' : 'rules',
            model: model.name,
            aiUrl: process.env.AI_URL ? 'configured' : 'not set',
        });
    });

    /* ---------- AI ---------- */
    app.post('/api/ai/generate', validate(generateBody), async (req: Request, res: Response) => {
        const { prompt, options } = req.body as GenerateBody;
        const result = await generate(prompt, options);
        const saved = generations.create({
            prompt,
            options,
            dsl: result.dsl,
            root: result.root,
            engine: result.engine,
        });
        res.json({
            id: saved.id,
            name: result.root.properties.title,
            engine: result.engine,
            model: result.model,
            dsl: result.dsl,
            root: result.root,
            html: exportHtml(result.root),
        });
    });

    /** Re-expand edited DSL without calling the model. */
    app.post('/api/ai/expand', validate(expandBody), (req, res) => {
        const { dsl } = req.body as { dsl: string };
        const root = normalizeNode(dslToTree(parseDsl(dsl))) as CanvasNode;
        res.json({ root, html: exportHtml(root), name: root.properties.title });
    });

    app.post('/api/ai/feedback', validate(feedbackBody), (req, res) => {
        const { id, rating } = req.body as { id: string; rating: number };
        res.json({ ok: generations.rate(id, rating) });
    });

    app.get('/api/ai/history', (_req, res) => {
        res.json(generations.list(50));
    });

    app.get('/api/ai/history/:id', validate(idParam, 'params'), (req, res) => {
        const row = generations.get(paramId(req));
        if (!row) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        res.json({ ...row, html: exportHtml(row.root) });
    });

    /** Rules engine preview, handy for building datasets from the UI. */
    app.post('/api/ai/rules', validate(generateBody), (req, res) => {
        const { prompt, options } = req.body as GenerateBody;
        res.json({ dsl: generateDsl(prompt, options) });
    });

    /* ---------- template library ---------- */
    app.get('/api/templates', (_req, res) => {
        res.json(templates.list());
    });

    app.get('/api/templates/:id', validate(idParam, 'params'), (req, res) => {
        const row = templates.get(paramId(req));
        if (!row) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        res.json(row);
    });

    app.get('/api/templates/:id/screenshot', validate(idParam, 'params'), (req, res) => {
        const file = screenshotFile(paramId(req));
        if (!file) {
            res.status(404).end();
            return;
        }
        res.setHeader('cache-control', 'public, max-age=60');
        res.sendFile(file);
    });

    app.get('/api/templates/:id/html', validate(idParam, 'params'), (req, res) => {
        const row = templates.get(paramId(req));
        if (!row) {
            res.status(404).end();
            return;
        }
        res.type('html').send(exportHtml(row.root));
    });

    app.post('/api/templates', validate(templateCreateBody), (req, res) => {
        const { name, root, prompt, screenshot } = req.body as TemplateCreateBody;
        const canvas = normalizeNode(root as unknown as CanvasNode) as CanvasNode;
        const row = templates.create({
            name: name || canvas.properties.title || 'Untitled',
            root: canvas,
            prompt: prompt ?? null,
        });
        const shot = saveScreenshot(row.id, screenshot);
        res.status(201).json(shot ? templates.update(row.id, { screenshot: shot }) : row);
    });

    app.put('/api/templates/:id', validate(idParam, 'params'), validate(templateUpdateBody), (req, res) => {
        const { name, root, screenshot } = req.body as TemplateUpdateBody;
        const shot = screenshot === undefined ? undefined : saveScreenshot(paramId(req), screenshot);
        const row = templates.update(paramId(req), {
            name,
            root: root ? (normalizeNode(root as unknown as CanvasNode) as CanvasNode) : undefined,
            screenshot: shot,
        });
        if (!row) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        res.json(row);
    });

    app.delete('/api/templates/:id', validate(idParam, 'params'), (req, res) => {
        removeScreenshot(paramId(req));
        res.json({ ok: templates.remove(paramId(req)) });
    });

    /* ---------- dataset ---------- */
    app.get('/api/dataset/approved.jsonl', (_req, res) => {
        res.type('application/x-ndjson').send(
            generations
                .approved()
                .map((row) => JSON.stringify({ prompt: row.prompt, dsl: row.dsl }))
                .join('\n'),
        );
    });

    /* ---------- static web build (single-process VPS deploy) ---------- */
    const webDist = path.resolve(process.env.WEB_DIST ?? '../web/dist');
    if (existsSync(webDist)) {
        app.use(express.static(webDist));
        app.get(/^(?!\/api\/).*/, (_req, res) => {
            res.sendFile(path.join(webDist, 'index.html'));
        });
    }

    /* ---------- errors ---------- */
    app.use((error: Error, _req: Request, res: Response, _next: express.NextFunction) => {
        const status = 'status' in error && typeof error.status === 'number' ? error.status : 500;
        res.status(status).json({ error: status === 500 ? 'internal error' : error.message });
    });

    return app;
};
