import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

import { nanoid } from 'nanoid';

import type { CanvasNode } from '@/types';

export const DATA_DIR = path.resolve(process.env.DATA_DIR ?? 'data');
export const SCREENSHOT_DIR = path.join(DATA_DIR, 'screenshots');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'app.db'));
db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    root TEXT NOT NULL,
    prompt TEXT,
    screenshot TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS generations (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    options TEXT NOT NULL,
    dsl TEXT NOT NULL,
    root TEXT NOT NULL,
    engine TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);
`);

// Additive migrations for databases created by earlier versions.
try {
    db.exec("ALTER TABLE templates ADD COLUMN kind TEXT NOT NULL DEFAULT 'user'");
} catch {
    // column already exists
}

export type TemplateKind = 'starter' | 'user' | 'ai';

export interface TemplateRow {
    id: string;
    name: string;
    kind: TemplateKind;
    root: CanvasNode;
    prompt: string | null;
    screenshot: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface GenerationRow {
    id: string;
    prompt: string;
    options: Record<string, unknown>;
    dsl: string;
    root: CanvasNode;
    engine: string;
    rating: number;
    createdAt: string;
}

const now = () => new Date().toISOString();

type Raw = Record<string, string | number | null>;

const toTemplate = (r: Raw): TemplateRow => ({
    id: String(r.id),
    name: String(r.name),
    kind: (String(r.kind ?? 'user') as TemplateKind) || 'user',
    root: JSON.parse(String(r.root)) as CanvasNode,
    prompt: r.prompt === null ? null : String(r.prompt),
    screenshot: r.screenshot === null ? null : String(r.screenshot),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
});

const toGeneration = (r: Raw): GenerationRow => ({
    id: String(r.id),
    prompt: String(r.prompt),
    options: JSON.parse(String(r.options)) as Record<string, unknown>,
    dsl: String(r.dsl),
    root: JSON.parse(String(r.root)) as CanvasNode,
    engine: String(r.engine),
    rating: Number(r.rating),
    createdAt: String(r.created_at),
});

export const templates = {
    list(): Omit<TemplateRow, 'root'>[] {
        return (
            db
                .prepare(
                    'SELECT id, name, kind, prompt, screenshot, created_at, updated_at FROM templates ORDER BY updated_at DESC',
                )
                .all() as Raw[]
        ).map((r) => {
            const { root: _root, ...rest } = toTemplate({ ...r, root: '{}' });
            return rest;
        });
    },
    get(id: string): TemplateRow | null {
        const row = db.prepare('SELECT * FROM templates WHERE id = ?').get(id) as
            | Raw
            | undefined;
        return row ? toTemplate(row) : null;
    },
    count(): number {
        const row = db.prepare('SELECT COUNT(*) AS n FROM templates').get() as Raw;
        return Number(row.n);
    },
    create(input: {
        name: string;
        root: CanvasNode;
        prompt?: string | null;
        screenshot?: string | null;
        kind?: TemplateKind;
    }): TemplateRow {
        const id = nanoid(10);
        const stamp = now();
        db.prepare(
            'INSERT INTO templates (id, name, kind, root, prompt, screenshot, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ).run(
            id,
            input.name,
            input.kind ?? (input.prompt ? 'ai' : 'user'),
            JSON.stringify(input.root),
            input.prompt ?? null,
            input.screenshot ?? null,
            stamp,
            stamp,
        );
        return templates.get(id) as TemplateRow;
    },
    update(
        id: string,
        input: { name?: string; root?: CanvasNode; screenshot?: string | null },
    ): TemplateRow | null {
        const existing = templates.get(id);
        if (!existing) return null;
        db.prepare(
            'UPDATE templates SET name = ?, root = ?, screenshot = ?, updated_at = ? WHERE id = ?',
        ).run(
            input.name ?? existing.name,
            JSON.stringify(input.root ?? existing.root),
            input.screenshot === undefined ? existing.screenshot : input.screenshot,
            now(),
            id,
        );
        return templates.get(id);
    },
    remove(id: string): boolean {
        const result = db.prepare('DELETE FROM templates WHERE id = ?').run(id);
        return Number(result.changes) > 0;
    },
};

export const generations = {
    list(limit = 50): Omit<GenerationRow, 'root'>[] {
        return (
            db
                .prepare(
                    'SELECT id, prompt, options, dsl, engine, rating, created_at FROM generations ORDER BY created_at DESC LIMIT ?',
                )
                .all(limit) as Raw[]
        ).map((r) => {
            const { root: _root, ...rest } = toGeneration({ ...r, root: '{}' });
            return rest;
        });
    },
    get(id: string): GenerationRow | null {
        const row = db.prepare('SELECT * FROM generations WHERE id = ?').get(id) as
            | Raw
            | undefined;
        return row ? toGeneration(row) : null;
    },
    create(input: {
        prompt: string;
        options: Record<string, unknown>;
        dsl: string;
        root: CanvasNode;
        engine: string;
    }): GenerationRow {
        const id = nanoid(10);
        db.prepare(
            'INSERT INTO generations (id, prompt, options, dsl, root, engine, rating, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
        ).run(
            id,
            input.prompt,
            JSON.stringify(input.options),
            input.dsl,
            JSON.stringify(input.root),
            input.engine,
            now(),
        );
        return generations.get(id) as GenerationRow;
    },
    rate(id: string, rating: number): boolean {
        const result = db
            .prepare('UPDATE generations SET rating = ? WHERE id = ?')
            .run(Math.max(-1, Math.min(1, Math.round(rating))), id);
        return Number(result.changes) > 0;
    },
    /** Prompt/DSL pairs the user liked; merged into the training set. */
    approved(): { prompt: string; dsl: string }[] {
        return (
            db
                .prepare('SELECT prompt, dsl FROM generations WHERE rating > 0')
                .all() as Raw[]
        ).map((r) => ({ prompt: String(r.prompt), dsl: String(r.dsl) }));
    },
};
