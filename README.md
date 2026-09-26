<p align="center">
  <img src="apps/web/public/logo.svg" width="72" alt="" />
</p>

<h1 align="center">Mailwright</h1>

<p align="center">
  Open-source drag-and-drop email template builder with an AI email designer,
  a curated template gallery and inbox-safe HTML export.
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#features">Features</a> ·
  <a href="#configuration">Configuration</a> ·
  <a href="#deploying">Deploying</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#contributing">Contributing</a>
</p>

![The Mailwright editor with a gallery template open](docs/screenshots/editor.png)

## What it is

Mailwright is a self-hostable web app for building marketing and transactional
emails without writing table-based HTML by hand:

- **Visual editor.** Rows, columns and 18 block types (headings, text, buttons,
  images, dividers, spacers, lists, menus, social links, footers, raw HTML,
  plus section blocks such as tables, icon grids, products, quotes, coupons and
  callouts), all drag-and-drop with undo/redo, keyboard shortcuts, per-device
  visibility and inline text editing with merge tags such as `{{first_name}}`.
- **AI email designer.** Describe the email in plain words and a Gemini-backed
  designer drafts a complete template, explains its choices, and then refines
  it turn by turn ("make the header dark", "add a coupon SAVE15", "shorter").
  It also suggests subject lines, answers email-marketing questions and finds
  gallery templates for you. Without an API key a built-in rules engine still
  produces solid templates.
- **Template gallery.** 26 ready-made templates, including 20 professional,
  large-format designs across e-commerce, SaaS, hospitality, finance, travel,
  non-profit, events and education. Open one, edit it, export it.
- **Inbox-safe export.** Table-based HTML with Outlook conditionals, Google
  Fonts fallbacks, a pre-flight checker for common deliverability mistakes,
  optional minification, preview on desktop, tablet and phone widths, and JSON
  import/export of the document.
- **Built for a public deployment.** One private AI conversation per browser,
  no vendor or model names exposed, per-IP rate limiting on AI routes, a
  read-only gallery, and optional Google AdSense placements.

## Screenshots

| Template gallery | AI email designer |
| --- | --- |
| ![Template gallery](docs/screenshots/gallery.png) | ![AI designer chat](docs/screenshots/ai-designer.png) |

| Draft applied to the editor | Preview |
| --- | --- |
| ![AI draft applied](docs/screenshots/ai-applied.png) | ![Preview dialog](docs/screenshots/preview.png) |

| Mobile view | Export with pre-flight checks |
| --- | --- |
| ![Mobile view](docs/screenshots/mobile.png) | ![Export dialog](docs/screenshots/export.png) |

## Quick start

Requirements: Node 22, [pnpm](https://pnpm.io) 10+, Docker (for PostgreSQL).
A [Gemini API key](https://aistudio.google.com/apikey) is optional but is what
turns the assistant into a real designer.

```bash
git clone https://github.com/waseemsajjad/mailwright.git
cd mailwright
pnpm install

# 1. Database (PostgreSQL 18 on 127.0.0.1:5432, user/password postgres)
pnpm db:up

# 2. Server settings
cp apps/server/.env.example apps/server/.env
#    put your key in GEMINI_API_KEY=...   (leave empty for the rules engine)

# 3. Run both apps
pnpm dev
```

Open http://localhost:3000. The web app proxies `/api` to the NestJS server on
port 8787, which applies the database migrations and seeds the gallery on
first start.

### Production build

```bash
pnpm build          # shared package check, web build, server bundle
pnpm start          # migrates, then serves the API and the built web app on :8787
```

The server serves `apps/web/dist` itself, so a single process (plus PostgreSQL)
is a complete deployment.

## Features

### Editor

- Canvas → rows → columns → blocks; column layouts from 1 to 4 columns with
  presets such as 1-2, 2-1 and 1-2-1.
- Block toolbar: move, duplicate, hide on mobile or desktop, delete, drag.
- Contenteditable headings and text with bold, italic, underline, links and
  merge-tag chips; a font picker with Google Fonts that export correctly.
- Property panels for every block, body settings (colours, width, fonts,
  merge tags with sample values), layers panel, autosave to the browser.
- Keyboard: Ctrl+Z / Ctrl+Y, Ctrl+P preview, Ctrl+E export, arrows to move
  the selection, Delete.

### AI email designer

- Chat in the left sidebar. The first message generates, later messages refine
  the template in the editor context, "suggest subject lines" returns subject
  and preheader ideas, "find templates about a sale" searches the gallery,
  and plain questions get a consultant-style answer.
- Options: email type (welcome, newsletter, promo, event, announcement,
  abandoned cart, receipt, feedback, win-back, invite), tone (friendly,
  professional, playful, urgent) and length (standard 5–9 sections, large
  10–14 sections).
- Each draft shows a rendered thumbnail, the designer's note, the compact DSL
  behind it, thumbs up/down, "Apply to editor" and "Add rows below".
- Gemini answers with structured JSON validated by the server; anything that
  does not parse falls back to the rules engine, so the chat always answers.

### Gallery

The gallery ships in the repository as [`gallery.json`](apps/server/src/templates/gallery.json)
and is seeded into the database by name on start-up, so every install gets the
same set. Regenerate or extend it with your own briefs:

```bash
cd apps/server
pnpm build:gallery                      # all briefs (needs GEMINI_API_KEY, ~25 min)
pnpm build:gallery -- --only "Black Friday"
```

### Export

Table-based HTML that renders in Gmail, Outlook (desktop and web), Apple Mail
and mobile clients, with MSO conditionals, `role="presentation"` tables,
bulletproof buttons, responsive columns and hide-on-mobile/desktop classes.
The pre-flight check flags missing alt text, placeholder links, missing
unsubscribe links and other deliverability problems before you copy or
download.

## Configuration

Server (`apps/server/.env`, see [`.env.example`](apps/server/.env.example)):

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | API port (also serves the web build) |
| `DATABASE_URL` | `postgresql://postgres:postgres@127.0.0.1:5432/postgres` | PostgreSQL connection |
| `GEMINI_API_KEY` | empty | Enables the AI designer; empty = rules engine |
| `GEMINI_MODEL` | `models/gemini-3.8-flash` | Gemini model id |
| `AI_TIMEOUT_MS` | `60000` | Per-call timeout for Gemini |
| `TRUST_PROXY` | `false` | `true` behind nginx/Cloudflare so rate limits see real IPs |
| `CORS_ORIGIN` | any | Comma-separated allowed origins |
| `WEB_DIST` | `../web/dist` | Built web app to serve |

Web (`apps/web/.env`, build-time, see [`.env.example`](apps/web/.env.example)):

| Variable | Purpose |
| --- | --- |
| `VITE_ADSENSE_CLIENT` | Google AdSense publisher id; empty = no ads |
| `VITE_ADSENSE_SLOT_SIDEBAR`, `VITE_ADSENSE_SLOT_LIBRARY` | Ad-unit ids for the two placements |
| `VITE_API_URL` | API origin when the web app is hosted separately |

For AdSense also replace the placeholder line in
[`apps/web/public/ads.txt`](apps/web/public/ads.txt).

## Deploying

A small VPS is enough. One way:

1. Install Node 22, pnpm and Docker; clone the repo; `pnpm install`.
2. `pnpm db:up` (or point `DATABASE_URL` at any PostgreSQL 14+).
3. Create `apps/server/.env` with `GEMINI_API_KEY`, `TRUST_PROXY=true` and
   `CORS_ORIGIN=https://your.domain`.
4. `pnpm build && pnpm start` under a process manager (systemd, pm2).
5. Put nginx or Caddy in front with HTTPS, proxying to `127.0.0.1:8787`.

Rate limits: 300 requests per minute per IP overall, 20 AI calls per 10 minutes
per IP on generation and chat routes; the gallery and health routes are exempt.

## Architecture

```
apps/web         Vite + React 19 + Zustand + dnd-kit + Tailwind 4 (the editor)
apps/server      NestJS 11 + Prisma 7 on PostgreSQL, @google/genai (API, AI, gallery, chat)
packages/shared  DOM-free document model, factories, tree ops, HTML exporter, starters
```

- The document is a plain JSON tree (`Canvas → Row → Column → block`) shared
  by the editor and the server; the exporter turns it into email HTML.
- The AI speaks a compact template DSL (a dozen lines for a whole email) that
  the server validates and expands into the document tree. The system prompt,
  structure guides per email type and voice rules live in
  [`prompts.ts`](apps/server/src/ai/engine/prompts.ts).
- Conversations, messages, generations and gallery templates are Prisma models;
  migrations run automatically on start.

Per-package notes for contributors live in `CLAUDE.md` files and
`.claude/skills` (they double as documentation for AI coding assistants).

## Development

```bash
pnpm dev            # both apps with hot reload
pnpm lint           # eslint + type checks in every package
pnpm build          # production build
pnpm db:down        # stop the database container
```

`apps/server`: `pnpm db:migrate:dev --name <change>` after editing
`prisma/schema.prisma`, `pnpm db:studio` to browse rows.

## Contributing

Issues and pull requests are welcome. Keep changes focused, run `pnpm lint`
and `pnpm build` before opening a PR, and add a gallery brief rather than a
hand-written template when you want to contribute designs.

## License

[MIT](LICENSE) © 2026 Waseem Sajjad
