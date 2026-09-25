# Server (apps/server)

Express 5 API on Node 22 with the built-in `node:sqlite`. Provides AI template
generation, a template library with screenshots, and generation history.

## Commands (run here)

- `pnpm dev` – tsx watch on http://localhost:8787
- `pnpm build` – `tsc --noEmit` + esbuild bundle to `dist/index.mjs` (via `build.mjs`, not the esbuild CLI)
- `pnpm start` – run the bundle (`node --no-warnings=ExperimentalWarning dist/index.mjs`)
- `pnpm dataset` – write `data/train.jsonl` / `data/eval.jsonl` for fine-tuning
- Python: `ai/README.md` (setup, `ai/pipeline.py`, `ai/train.py`, `ai/serve.py`)

## Layout

- `src/app.ts` – routes. Every body/param goes through a zod schema in `src/schemas.ts` via `validate()`.
- `src/ai.ts` – engines: axios call to the Python model service (`AI_URL`, default http://127.0.0.1:8000, `off` disables), fallback to the rules engine. `generate()` and `refine()` take `history` (earlier chat prompts); `withHistory()` in `generator.ts` derives company/brand/tone/type from it.
- `src/refine.ts` – rules-based follow-up edits (tone, colours, header style, add/remove blocks, button/heading/title text, shorten). Also synthesises refinement training pairs.
- `src/subjects.ts` – subject line / preheader ideas. `src/seed.ts` – starter templates seeded into an empty library. `src/prompts.ts` – prompt formats plus the T5 text codec (`encodeForModel`/`decodeFromModel`/`repairDsl`, mirrored in `ai/codec.py`).
- `src/generator.ts` – rules engine (prompt analysis + blueprints + copy banks). Also the dataset source.
- `src/dsl.ts` – the compact template DSL: `parseDsl`, `dslToTree`, `stringifyDsl`.
- `src/db.ts` – SQLite tables `templates` and `generations`; `DATA_DIR` (default `data/`).
- `src/screenshot.ts` – PNG data URLs saved under `DATA_DIR/screenshots`.
- Shared code is imported from the web app through the `@/` alias (`../web/src`): types, factory, tree, export. Never import web files that touch the DOM or Vite (`utils/api.ts`, `utils/screenshot.ts` are deliberately not in the utils barrel).

## Env

Loaded from `.env` when present (see `.env.example`): `PORT` (8787), `DATA_DIR`,
`AI_URL` (default http://127.0.0.1:8000; `off` = rules only), `AI_TIMEOUT_MS`,
`CORS_ORIGIN` (comma list), `WEB_DIST` (serves the built web app when present).
Templates carry a `kind`: `starter` (seeded), `user`, `ai` (saved with a prompt).

## Rules

- Add a request field → add it to the zod schema first.
- New DSL block → `dsl.ts` (`BLOCK_KINDS`, `blockToNode`) and, if the rules engine should emit it, `generator.ts`.
- Keep the DSL small: the fine-tuned model's output budget is 512 tokens.
