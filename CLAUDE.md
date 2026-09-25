# Email Template Builder (workspace)

pnpm workspace. The editor app lives in `apps/web`; read `apps/web/CLAUDE.md`
for its commands, layout and rules. Run app commands from `apps/web`
(`cd apps/web && pnpm lint && pnpm build`) or with `pnpm -r <script>` from here.

Project skills live in `.claude/skills` at this root:
- `email-builder-dev` – architecture, store rules, add-a-block checklist
- `email-html-compat` – rules for inbox-safe export HTML
