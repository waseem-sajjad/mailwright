# Server (apps/server)

NestJS 11 API (scaffolded with `nest new`, webpack builder) on PostgreSQL 18
through Prisma 7. Provides AI template generation (Gemini via `@google/genai`
acting as a senior email designer, rules-engine fallback), ChatGPT-style
conversations, a template library with screenshots and keyword search, and
generation history.

## Commands (run here)

- `pnpm dev` – `prisma migrate deploy` then `nest start --watch` on http://localhost:8787
- `pnpm build` – `prisma generate` + `nest build` (webpack bundle → `dist/main.js`; the
  bundle includes `@email-builder/shared`, other node_modules stay external)
- `pnpm start` – migrate, then run the bundle (serves `../web/dist` when present)
- `pnpm lint` – `tsc --noEmit` + eslint; `pnpm db:migrate:dev` for new migrations
  (destructive ones need a hand-written SQL file + `pnpm db:migrate`), `pnpm db:studio`
- Infra: `docker compose up -d postgres` (repo root)

## Layout (`src/`)

- `main.ts` – bootstrap: body limit 12 MB (screenshots), CORS, `trust proxy` when
  `TRUST_PROXY=true`, `ApiExceptionFilter`.
- Rate limits (`@nestjs/throttler`, global guard): 120 requests/min per IP, and the `ai`
  bucket of 20 model calls per 10 min on `/api/ai/*` and `/api/chat/:id/messages`.
- `app.module.ts` – `ConfigModule` (global, `config/app.config.ts` via `registerAs`,
  env validated by zod in `config/env.validation.ts`), `ServeStaticModule` for the web
  build (excludes `/api/{*path}`), `PrismaModule`, `ProvidersModule`, `TemplatesModule`,
  `AiModule`, `ChatModule`, `HealthController`.
- `prisma/prisma.service.ts` – `PrismaClient` + `@prisma/adapter-pg`. Schema in
  `prisma/schema.prisma`, SQL migrations in `prisma/migrations`. Generated client:
  `src/generated/prisma` (gitignored, `postinstall` regenerates).
- `ai/gemini.service.ts` – `text()` and `json()` (structured output with a
  `responseSchema`) on `@google/genai`; every call degrades to `null`.
- `ai/engine/prompts.ts` – the professional system prompt (creative-director persona,
  structure guides per email type, voice per tone, the DSL grammar), the JSON schemas
  (`GENERATE_SCHEMA` → `{ dsl, summary }`, `REFINE_SCHEMA` → `{ dsl, changes, summary }`,
  `SUBJECTS_SCHEMA`, `INTENT_SCHEMA`) and the prompt builders (generate, refine,
  subjects, intent routing, consultant answers, conversation title).
- `ai/ai.service.ts` – `generate()` (library templates with DSL that share keywords with
  the brief go to Gemini as references → `references`), `refine()`, `subjects()`,
  `classify()` (Gemini routes chat messages; heuristics from `chat/intent.ts` when it is
  off), `answer()` (consultant reply, no template), `title()`, `expand()`, history and
  ratings. Falls back to the rules engine whenever Gemini is missing, fails, or answers
  without a parseable row. Responses never carry vendor or model names (`engine` is an
  internal enum; `/api/health` only says `ai: true|false`).
- `ai/engine/` – pure code: `dsl.ts` (parse/expand/stringify), `generator.ts` (rules
  engine, `size: 'large'` adds extra sections, `withHistory()`), `refine.ts`, `subjects.ts`.
- `chat/` – conversations stored in Postgres (`conversations`, `messages`; generations
  link back via `conversation_id`). `chat.service.ts` runs a turn: store the user
  message, AI-title the chat on its first message, classify, act (search / subjects /
  refine / generate / answer) with the conversation's own context (brief + current DSL +
  applied steps in `conversation.context`), store the reply (`generationId` + payload).
  Routes: `POST /api/chat`, `GET/DELETE /api/chat/:id`, `POST /api/chat/:id/messages`,
  `POST /api/chat/:id/reset`. There is deliberately no listing route: the site is
  public and a conversation is private to the browser that holds its id.
- `ai/schemas.ts`, `templates/schemas.ts`, `chat/schemas.ts` – zod bodies; bound per route
  with `ZodValidationPipe` (`common/zod.pipe.ts`). Errors leave as `{ error, issues? }`.
- `templates/templates.service.ts` – CRUD, screenshots as `Bytes`, `list({ q })` (stemmed
  keyword search over name, prompt and DSL), `examplesFor()` and seeding (web starters +
  three large rules-engine templates with DSL).
- Shared code comes from the workspace package `@email-builder/shared` (`/types`,
  `/utils`); `webpack.config.js` allowlists it so its TypeScript source is bundled.

## Conventions

- Constructor injection uses explicit `@Inject(Token)`; keep it that way.
- Add a request field → zod schema first. New DSL block → `engine/dsl.ts`, the grammar in
  `engine/prompts.ts`, and `engine/generator.ts` if the rules engine should emit it.
- Gemini output is only trusted when `parseDsl` yields at least one row; keep the rules
  engine working so the product answers without a key.
- Env: `PORT`, `DATABASE_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_TIMEOUT_MS`,
  `TRUST_PROXY`, `CORS_ORIGIN`, `WEB_DIST`.
