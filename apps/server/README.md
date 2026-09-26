# apps/server

NestJS API for the email template builder. See `CLAUDE.md` for the layout and
rules, `.env.example` for configuration.

```bash
docker compose up -d postgres      # from the repo root: PostgreSQL 18
pnpm dev                           # migrates, then nest start --watch on :8787
pnpm build && pnpm start           # production bundle (serves ../web/dist too)
```
