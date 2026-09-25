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
- `src/ai.ts` – engines: axios call to the Python model service (`AI_URL`), fallback to the rules engine.
- `src/generator.ts` – rules engine (prompt analysis + blueprints + copy banks). Also the dataset source.
- `src/dsl.ts` – the compact template DSL: `parseDsl`, `dslToTree`, `stringifyDsl`.
- `src/db.ts` – SQLite tables `templates` and `generations`; `DATA_DIR` (default `data/`).
- `src/screenshot.ts` – PNG data URLs saved under `DATA_DIR/screenshots`.
- Shared code is imported from the web app through the `@/` alias (`../web/src`): types, factory, tree, export. Never import web files that touch the DOM or Vite (`utils/api.ts`, `utils/screenshot.ts` are deliberately not in the utils barrel).

## Env

`PORT` (8787), `DATA_DIR`, `AI_URL` (e.g. http://127.0.0.1:8000), `AI_TIMEOUT_MS`,
`CORS_ORIGIN` (comma list), `WEB_DIST` (serves the built web app when present).

## Rules

- Add a request field → add it to the zod schema first.
- New DSL block → `dsl.ts` (`BLOCK_KINDS`, `blockToNode`) and, if the rules engine should emit it, `generator.ts`.
- Keep the DSL small: the fine-tuned model's output budget is 512 tokens.
