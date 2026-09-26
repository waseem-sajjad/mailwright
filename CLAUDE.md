# Mailwright (workspace)

pnpm workspace with two apps and one shared package:

- `apps/web` – the drag-and-drop editor (Vite + React). See `apps/web/CLAUDE.md`.
- `apps/server` – NestJS + Prisma on PostgreSQL: AI template generation and
  chat (Gemini via `@google/genai`, rules-engine fallback), template library
  with screenshots. See `apps/server/CLAUDE.md`.
- `packages/shared` (`@mailwright/shared`) – the DOM-free document model,
  factories, tree ops, HTML exporter and starters both apps import. See
  `packages/shared/CLAUDE.md`.

Infra: `docker compose up -d postgres`. Root scripts: `pnpm dev` (both apps),
`pnpm build`, `pnpm lint`, `pnpm start` (server; serves `apps/web/dist` too).
In dev, Vite proxies `/api` to the server on 8787.

Project skills live in `.claude/skills` at this root:
- `email-builder-dev` – architecture, store rules, add-a-block checklist
- `email-html-compat` – rules for inbox-safe export HTML
- `nestjs-server` – how the Nest/Prisma server and its Gemini AI are built and extended
