# Email Template Builder (workspace)

pnpm workspace with two apps:

- `apps/web` – the drag-and-drop editor (Vite + React). See `apps/web/CLAUDE.md`.
- `apps/server` – Express + SQLite API: AI template generation (rules engine or
  a fine-tuned flan-t5 served by Python), template library with screenshots.
  See `apps/server/CLAUDE.md` and `apps/server/ai/README.md`.

Root scripts: `pnpm dev` (both apps), `pnpm build`, `pnpm lint`, `pnpm dataset`,
`pnpm start` (server; serves `apps/web/dist` too). In dev, Vite proxies `/api`
to the server on 8787.

Project skills live in `.claude/skills` at this root:
- `email-builder-dev` – architecture, store rules, add-a-block checklist
- `email-html-compat` – rules for inbox-safe export HTML
