import { existsSync } from 'node:fs';
import path from 'node:path';

import cors from 'cors';
import express, { type Request, type Response } from 'express';

import type { CanvasNode } from '@/types';
import { exportHtml, normalizeNode } from '@/utils';

import { generate, modelStatus, refine, subjects } from './ai.ts';
import { generations, templates } from './db.ts';
import { generateDsl } from './generator.ts';
import { seedStarters } from './seed.ts';
import { removeScreenshot, saveScreenshot, screenshotFile } from './screenshot.ts';
import { dslToTree, parseDsl } from './dsl.ts';
import {
    expandBody,
    feedbackBody,
    generateBody,
    idParam,
    refineBody,
    subjectsBody,
    templateCreateBody,
    templateUpdateBody,
    validate,
    type GenerateBody,
    type RefineBody,
    type TemplateCreateBody,
    type TemplateUpdateBody,
} from './schemas.ts';

/** Express 5 types params as string | string[]; ids are validated as strings. */
const paramId = (req: Request): string => String(req.params.id);

export const createApp = () => {
    const app = express();
    seedStarters();
    app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
    app.use(express.json({ limit: '25mb' }));

    /* ---------- health ---------- */
    app.get('/api/health', async (_req, res) => {
        const model = await modelStatus();
        res.json({
            ok: true,
            engine: model.ok ? 'gemini' : 'rules',
            model: model.name,
        });
    });

    /* ---------- AI ---------- */
    app.post('/api/ai/generate', validate(generateBody), async (req: Request, res: Response) => {
        const { prompt, options, history } = req.body as GenerateBody;
        const result = await generate(prompt, options, history);
        const saved = generations.create({
            prompt,
            options: history.length > 0 ? { ...options, history } : options,
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

    /** Follow-up instruction applied to a previous result (chat refinement). */
    app.post('/api/ai/refine', validate(refineBody), async (req: Request, res: Response) => {
        const { prompt, dsl, instruction, options, history } = req.body as RefineBody;
        const result = await refine(prompt, dsl, instruction, options, history);
        const saved = generations.create({
            prompt: `${prompt}\n→ ${instruction}`,
            options: { ...options, refine: true, instruction, history },
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
            applied: result.applied,
        });
    });

    /** Subject line and preheader ideas for a brief. */
    app.post('/api/ai/subjects', validate(subjectsBody), async (req, res) => {
        const { prompt, options, history } = req.body as GenerateBody;
        res.json(await subjects(prompt, options, history));
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

    /** Rules engine preview without Gemini. */
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

    app.post('/api/templates/:id/duplicate', validate(idParam, 'params'), (req, res) => {
        const source = templates.get(paramId(req));
        if (!source) {
            res.status(404).json({ error: 'not found' });
            return;
        }
        const copy = templates.create({
            name: `${source.name} (copy)`,
            root: source.root,
            prompt: source.prompt,
            kind: 'user',
        });
        res.status(201).json(copy);
    });

    app.delete('/api/templates/:id', validate(idParam, 'params'), (req, res) => {
        removeScreenshot(paramId(req));
        res.json({ ok: templates.remove(paramId(req)) });
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
