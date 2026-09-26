---
name: nestjs-server
description: How the NestJS + Prisma + pgvector API in apps/server is built, run, verified and extended (modules, zod pipes, Gemini/Ollama providers, vector queries). Load before changing anything under apps/server.
---

# NestJS server development

## Run and verify

```bash
docker compose up -d postgres            # repo root; pgvector/pgvector:pg18-trixie on 127.0.0.1:5432
ollama pull nomic-embed-text             # embeddings (768-d) for pgvector
cd apps/server
pnpm dev                                 # prisma migrate deploy + nest start --watch (:8787)
pnpm lint                                # tsc --noEmit + eslint (must exit 0)
pnpm build                               # prisma generate + nest build (webpack → dist/main.js)
node dist/main.js                        # run the bundle; then curl the routes
```

There is no test suite yet (jest is configured by the scaffold). Verify with
curl: `/api/health` must report `engine` and `embeddings.ok`; generate with
`{"prompt":"…","options":{"size":"large"}}`; `GET /api/templates?q=…` returns
`score` when vectors work. Run curl chains under `bash <<'EOF'` (zsh chokes
on them). Never `pkill -f` with a pattern that appears in your own command
line (it kills the shell): kill by port with `fuser -k 8787/tcp`.

## Why the setup looks like this

- Scaffolded with `nest new` (CommonJS, eslint + prettier; jest removed).
  Builder is **webpack** (`nest-cli.json` → `webpack.config.js`) because the
  server imports `@email-builder/shared`, a workspace package shipped as
  TypeScript source: the config allowlists it in `webpack-node-externals` so
  it is bundled while real node_modules stay external. Nest CLI 11 offers
  tsc | swc | webpack (rspack is v12). `tsconfig` uses `module: esnext`,
  `moduleResolution: bundler`.
- **Prisma 7** needs a driver adapter: `PrismaService` extends the generated
  client with `new PrismaPg({ connectionString })`. Generator `prisma-client`
  with `moduleFormat = "cjs"` into `src/generated/prisma` (gitignored;
  `postinstall` runs `prisma generate`). Config in `prisma.config.ts`
  (reads `.env` with `process.loadEnvFile`).
- **pgvector**: columns are `Unsupported("vector(768)")`, so Prisma never
  selects them; write with `$executeRaw\`UPDATE … SET embedding = ${JSON.stringify(vec)}::vector\``
  and search with `$queryRaw` ordering by `embedding <=> $vec::vector`
  (cosine; score = `1 - distance`). HNSW indexes are hand-written in
  `prisma/migrations/0001_init/migration.sql`. New migration: edit
  `schema.prisma`, `pnpm db:migrate:dev --name x`, then add any raw SQL.
- **DI**: constructors use explicit `@Inject(Token)` everywhere so the code
  does not depend on `emitDecoratorMetadata` (keeps tsx/esbuild usable).
- **Validation**: zod schemas next to each feature (`ai/schemas.ts`,
  `templates/schemas.ts`), bound with `@Body(new ZodValidationPipe(schema))`,
  `@Query(...)`, `@Param('id', new ZodValidationPipe(idParam))`. The global
  `ApiExceptionFilter` turns every exception into `{ error, issues? }` (the web
  client reads `error`). Throw `NotFoundException('not found')` for 404s.
- **Config**: `@nestjs/config` global module; `config/app.config.ts` uses
  `registerAs('app', …)` and services inject it with `@Inject(appConfig.KEY)
  config: AppConfig`. Env is validated by zod (`validate: validateEnv`).
- **Static web**: `ServeStaticModule.forRootAsync` serves `WEB_DIST`
  (default `../web/dist`) only when it exists, `exclude: ['/api/{*path}']`
  (Express 5 path syntax).
- **Providers** (`ai/providers.module.ts`, global): `GeminiService`
  (`@google/genai`: `generateContent` with `systemInstruction`,
  `responseMimeType: 'application/json'` + `responseSchema` for JSON,
  `embedContent` with `outputDimensionality: 768`) and `EmbeddingsService`
  (Ollama `POST /api/embed` with `search_query:` / `search_document:`
  prefixes, unit-normalised; provider chosen by `EMBEDDINGS_PROVIDER`).
  Both degrade to `null` so callers fall back (rules engine / keyword search).

## Chat module

`chat/chat.service.ts` owns the conversation flow; the web store is a thin
client. A turn = `send(conversationId, text, options)`: append the user
message → `classify()` (`chat/intent.ts`) → search / subjects / refine /
generate through `AiService` (which links the generation to the
conversation) → append the assistant message with `generationId` and a small
`payload` (subjects, template hits, applied steps, references, model) →
bump `updatedAt`. `get()` expands messages by joining `generations`
(`dsl`, `root`, `rating`) and rendering `html` on the fly. Context lives in
`conversation.context` (`{ prompt, dsl, steps }`); `reset` clears it with
`Prisma.DbNull`. Intent rules are plain functions: extend them there.

## Adding things

- **Route**: controller method + zod schema + service method. Keep controllers
  thin; services own Prisma access.
- **Column**: `schema.prisma` → migration → service mapping (`summary()` /
  `fromRaw()` in `templates.service.ts` both need the field).
- **Shared model changes** (types, factory, export) go in `packages/shared`, not here.
- **Searchable text**: anything that should influence vectors goes through
  `templateText()`; call `embedTemplate(id)` after writing.
- **DSL block**: `ai/engine/dsl.ts` (+ `BLOCK_KINDS`, `blockToNode`), the grammar
  in `ai/engine/prompts.ts`, `ai/engine/generator.ts` if the rules engine emits it.
- **Large templates**: `size: 'large'` → `extraSections()` in `generator.ts` for
  rules, the "Length: LARGE" hint for Gemini.

## Gotchas

- eslint here is the Nest scaffold config (type-aware `no-unsafe-*` rules);
  cast `node.properties` to `Record<string, unknown>` before `Object.entries`.
- Screenshot bodies are data URLs up to 8 MB: `main.ts` sets the JSON body
  limit to 12 MB (`bodyParser: false` + `app.useBodyParser`).
- `@google/genai` and `nanoid` style ESM packages are fine because webpack
  keeps node_modules external and Node 22 can `require()` ESM.
- Deleting `postgres_data/` resets the database; seeding re-runs when the
  `templates` table is empty.
