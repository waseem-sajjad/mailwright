# Server (apps/server)

Express 5 API on Node 22 with the built-in `node:sqlite`. Provides AI template
generation (Gemini via `@google/genai`, rules engine fallback), a template
library with screenshots, and generation history.

## Commands (run here)

- `pnpm dev` – tsx watch on http://localhost:8787
- `pnpm build` – `tsc --noEmit` + esbuild bundle to `dist/index.mjs` (via `build.mjs`, not the esbuild CLI)
- `pnpm start` – run the bundle (`node dist/index.mjs`)

## Layout

- `src/app.ts` – routes. Every body/param goes through a zod schema in `src/schemas.ts` via `validate()`.
- `src/ai.ts` – engines: `generate()`, `refine()` and `subjects()` ask Gemini (`GEMINI_API_KEY`, `GEMINI_MODEL`) and fall back to the rules engine when the key is missing, the call fails or the answer does not parse. All three take `history` (earlier chat prompts); `withHistory()` in `generator.ts` derives company/brand/tone/type from it.
- `src/prompts.ts` – Gemini system instruction (the DSL grammar), the prompt builders, one rules-engine example document and `cleanDsl()` (strips fences).
- `src/refine.ts` – rules-based follow-up edits (tone, colours, header style, add/remove blocks, button/heading/title text, shorten).
- `src/subjects.ts` – rules-based subject line / preheader ideas. `src/seed.ts` – starter templates seeded into an empty library.
- `src/generator.ts` – rules engine (prompt analysis + blueprints + copy banks).
- `src/dsl.ts` – the compact template DSL: `parseDsl`, `dslToTree`, `stringifyDsl`.
- `src/db.ts` – SQLite tables `templates` and `generations`; `DATA_DIR` (default `data/`).
- `src/screenshot.ts` – PNG data URLs saved under `DATA_DIR/screenshots`.
- Shared code is imported from the web app through the `@/` alias (`../web/src`): types, factory, tree, export. Never import web files that touch the DOM or Vite (`utils/api.ts`, `utils/screenshot.ts` are deliberately not in the utils barrel).

## Env

Loaded from `.env` when present (see `.env.example`): `PORT` (8787), `DATA_DIR`,
`GEMINI_API_KEY` (unset = rules engine only), `GEMINI_MODEL` (default
`models/gemini-3.8-flash`), `AI_TIMEOUT_MS`, `CORS_ORIGIN` (comma list),
`WEB_DIST` (serves the built web app when present).
Templates carry a `kind`: `starter` (seeded), `user`, `ai` (saved with a prompt).

## Rules

- Add a request field → add it to the zod schema first.
- New DSL block → `dsl.ts` (`BLOCK_KINDS`, `blockToNode`), the grammar in `prompts.ts` and, if the rules engine should emit it, `generator.ts`.
- Keep the DSL small and strict: Gemini answers are only accepted when `parseDsl` yields at least one row.
