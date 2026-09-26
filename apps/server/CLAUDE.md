# Server (apps/server)

NestJS 11 API (scaffolded with `nest new`, webpack builder) on PostgreSQL 18 +
pgvector through Prisma 7. Provides AI template generation (Gemini via
`@google/genai`, rules-engine fallback), a template library with screenshots
and semantic search, and generation history.

## Commands (run here)

- `pnpm dev` – `prisma migrate deploy` then `nest start --watch` on http://localhost:8787
- `pnpm build` – `prisma generate` + `nest build` (webpack bundle → `dist/main.js`; the
  bundle includes `@email-builder/shared`, other node_modules stay external)
- `pnpm start` – migrate, then run the bundle (serves `../web/dist` when present)
- `pnpm lint` – `tsc --noEmit` + eslint; `pnpm db:migrate:dev` for new migrations,
  `pnpm db:studio` to browse rows
- Infra: `docker compose up -d postgres` (repo root), `ollama pull nomic-embed-text`

## Layout (`src/`)

- `main.ts` – bootstrap: body limit 12 MB (screenshots), CORS, `ApiExceptionFilter`.
- `app.module.ts` – `ConfigModule` (global, `config/app.config.ts` via `registerAs`,
  env validated by zod in `config/env.validation.ts`), `ServeStaticModule` for the web
  build (excludes `/api/{*path}`), `PrismaModule`, `ProvidersModule`, `TemplatesModule`,
  `AiModule`, `HealthController`.
- `prisma/prisma.service.ts` – `PrismaClient` + `@prisma/adapter-pg`; creates the
  `vector` extension on init. Schema in `prisma/schema.prisma`, SQL migrations in
  `prisma/migrations` (HNSW indexes live there; `Unsupported("vector(768)")` columns
  are read/written with `$queryRaw`/`$executeRaw`). Generated client:
  `src/generated/prisma` (gitignored, `postinstall` regenerates).
- `ai/gemini.service.ts` – text, JSON (subject ideas) and embedding calls.
- `ai/embeddings.service.ts` – embeddings provider: Ollama `nomic-embed-text`
  (default, 768-d, task prefixes `search_query:`/`search_document:`), Gemini, or off.
- `ai/ai.service.ts` – `generate()` (pgvector finds the 2 closest library templates with
  DSL and hands them to Gemini as examples → `references`), `refine()`, `subjects()`,
  `expand()`, history and ratings. Falls back to the rules engine whenever Gemini is
  missing, fails, or answers without a parseable row.
- `ai/engine/` – pure code shared with nothing else: `dsl.ts` (parse/expand/stringify),
  `generator.ts` (rules engine, `size: 'large'` adds extra sections, `withHistory()`),
  `refine.ts`, `subjects.ts`, `prompts.ts` (Gemini grammar + prompt builders).
- `chat/` – ChatGPT-style conversations stored in Postgres (`conversations`,
  `messages`; generations link back via `conversation_id`). `chat.service.ts` runs a
  turn: stores the user message, classifies it (`chat/intent.ts`: library search /
  subject lines / refinement / generation), calls `AiService` with the conversation's
  own context (brief + current DSL + applied steps, kept in `conversation.context`) and
  earlier prompts, stores the answer, auto-titles the chat from the first prompt.
  Routes: `GET/POST /api/chat`, `GET/PATCH/DELETE /api/chat/:id`,
  `POST /api/chat/:id/messages`, `POST /api/chat/:id/reset`.
- `ai/schemas.ts`, `templates/schemas.ts`, `chat/schemas.ts` – zod bodies; bound per route with
  `ZodValidationPipe` (`common/zod.pipe.ts`). Errors leave as `{ error, issues? }`.
- `templates/templates.service.ts` – CRUD, screenshots as `Bytes`, `list({ q })`
  (vector search when embeddings work, ILIKE otherwise), `similar(id)`, `embedTemplate`,
  `reindex()` and seeding (web starters + three large rules-engine templates with DSL).
- Shared code comes from the workspace package `@email-builder/shared` (`/types`,
  `/utils`): document model, factory, tree, export, starters. `webpack.config.js`
  allowlists it so its TypeScript source is bundled instead of treated as external.

## Conventions

- Constructor injection uses explicit `@Inject(Token)`; keep it that way so the code
  also runs under esbuild/tsx style transpilers that drop decorator metadata.
- Add a request field → zod schema first. New DSL block → `engine/dsl.ts`, the grammar in
  `engine/prompts.ts`, and `engine/generator.ts` if the rules engine should emit it.
- Anything that should be searchable must get an embedding: call `embedTemplate(id)`
  after writes (create/update already do).
- Env: `PORT`, `DATABASE_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_TIMEOUT_MS`,
  `EMBEDDINGS_PROVIDER` (ollama|gemini|off), `OLLAMA_URL`, `OLLAMA_EMBED_MODEL`,
  `GEMINI_EMBEDDING_MODEL`, `CORS_ORIGIN`, `WEB_DIST`.
