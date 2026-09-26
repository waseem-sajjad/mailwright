---
name: email-builder-dev
description: Architecture, conventions and the add-a-block checklist for this email template builder (React 19 + Zustand + dnd-kit + Tailwind 4). Load before changing anything under src/.
---

# Email builder development

The repo is a pnpm workspace; the app is `apps/web` and every path below is
relative to it. Run the commands from `apps/web`. The pnpm store is at the
workspace root (`../../node_modules/.pnpm`); `pnpm-workspace.yaml` sets
`publicHoistPattern: ['@types/*']` so declaration files in the store can see
React's types after the next `pnpm install`. Until then, annotate callback
parameters of third-party components explicitly (see `dnd.tsx`).

## Commands

```bash
cd apps/web
pnpm dev          # Vite dev server on http://localhost:3000
pnpm build        # tsc -b && vite build  (must pass before finishing)
pnpm lint         # eslint . (must exit 0; run `npx eslint . --fix` then `npx prettier --write "src/**/*.{ts,tsx}"`)
```

There is no test runner. For logic that does not touch the DOM (tree ops,
store, export) bundle a script with the workspace's esbuild and run it in Node:

```bash
ESB=$(ls -d ../../node_modules/.pnpm/esbuild@*/node_modules/esbuild/bin/esbuild | head -1)
$ESB script.ts --bundle --platform=node --format=esm --alias:@=./src --outfile=out.mjs && node out.mjs
```

## Data model

- The document is a plain serialisable tree of `EmailNode { id, type, properties, children }`
  (`packages/shared/src/types/common.ts`). No classes, no parent pointers.
  Always create new objects; never mutate a node in place.
- Types, factories, tree ops, the exporter, starters, merge-tag helpers and
  pre-flight checks live in the workspace package `@mailwright/shared`
  (`packages/shared/src`). The web app re-exports them from `@/types` and
  `@/utils`, so component code imports those as before; DOM-bound helpers
  (`cn`, `storage`, `selection`, `mergeTagDom`, `api`, `screenshot`) stay in
  `apps/web/src/utils`. Nothing in the package may touch the DOM at import
  time: the server bundles it.
- Hierarchy is fixed: `Canvas → Row → Column → content`. Content types are
  everything except Canvas/Row/Column (`ContentType`).
- All tree operations live in `packages/shared/src/utils/tree.ts` (find, insert, remove,
  move, duplicate, mapNode). Use them instead of hand-rolling recursion.
- Defaults for every block are factory functions in `packages/shared/src/utils/factory.ts`.
  Row layouts are percentage arrays (`COLUMN_LAYOUTS`); `applyLayout` reshapes
  a row's columns while preserving content.
- Schema changes: add new properties as optional OR add a default in the
  factory. `normalizeNode` (factory.ts) deep-merges defaults into any loaded
  document (autosave, JSON import, library) so older saves keep working. Every
  load path must go through it.
- Rows and content blocks share `Visibility` (`hideOnMobile`/`hideOnDesktop`);
  the generic `VisibilityFields` section is rendered by `panel.tsx`, not by
  each property panel.
- Merge tags live on the canvas (`CanvasProperties.mergeTags`) and are written
  into text as `{{tag}}`; `src/utils/mergeTags.ts` substitutes samples for the
  preview only. Export leaves them untouched.

## State (`src/hooks/useEmail.ts`)

- Single Zustand store: `root`, `activeId`, `past`/`future` (undo/redo), `name`.
- `updateProperties(id, partial, { transient: true })` for keystroke-level or
  drag-level edits: consecutive transient edits collapse into ONE undo entry
  until `commit()` is called (call it on blur / popover close).
- Autosave to `localStorage` is a debounced `subscribe` at the bottom of the
  file; nothing else should write storage.
- In components use `useNodeProps(node)` (`src/hooks/useNodeProps.ts`) which
  gives `{ p, set, setTransient, commit }` bound to that node.
- Other store actions: `copyNode`/`pasteNode` (in-memory clipboard; paste
  targets the sensible parent of the selection), `reorderColumn`,
  `selectSibling`/`selectParent`/`selectChild` (arrow keys), `pendingFocus`
  (newly added Heading/Text grabs focus via `block/editable.tsx`).

## Drag and drop (`src/components/dnd.tsx`)

- Draggables carry `DragData`: `{ type: 'card', name, kind }` from the palette
  or `{ type: 'block', id, kind }` from a block's grip handle.
- Drop targets are `<Slot kind parentId index>` components. `kind` is
  `'row' | 'column' | 'content'` and MUST match the drag's kind; the custom
  collision detection filters on it. Column cards drop onto row slots and call
  `addColumn`.
- `useSettings().dragging` is true during a drag; the block toolbar hides then.

## Rendering

- Canvas blocks: `src/components/block/*.tsx`, dispatched by `block/content.tsx`
  and wrapped in `Container` (hover/active outline, toolbar).
- Heading/Text use `block/editable.tsx` (contentEditable). The DOM is the source
  of truth while focused; never pass `dangerouslySetInnerHTML` to it. The block
  records its selection via `src/utils/selection.ts`; anything that must act on
  that selection after focus moved (toolbar, tag picker) calls `execOnEditable`
  and, for menus, passes `preserveFocus` to `Menu`.
- Merge tags render as chips in the editor only. `decorateTags`/`undecorateTags`
  (`utils/mergeTags.ts`) convert between `{{tag}}` text and
  `<span class="merge-tag" data-merge-tag contenteditable="false">`; the store
  and export always hold the plain form. `Editable` decorates on render and
  undecorates on input; `decorateLiveTags` (`utils/mergeTagDom.ts`) turns a
  hand-typed tag into a chip and parks the caret after it with a ZWSP.
  Non-editable blocks use `<TagText>` (React) or `decorateTags` on HTML.
- Fonts: `FONT_FAMILIES` in `factory.ts` carries `group` and an optional
  `google` family. `FontSelect` renders each option in its face; the editor
  loads all web fonts via `main.css`, and `export.ts` links only the Google
  families the document uses, inside `<!--[if !mso]>`.
- Plain inputs that should accept merge tags use `TagInput`
  (`components/ui/taginput.tsx`), which inserts `{{tag}}` at the caret.
- Device visibility on the canvas is handled entirely by `Container`: pass
  `visibility={{ hideOnMobile, hideOnDesktop }}` and it dims, badges, offers a
  toolbar toggle, and collapses the block when `useSettings().showHidden` is
  off (header eye toggle).
- Toggles use `Switch`/`CheckBox` from `components/ui/checkbox.tsx`, a
  `button[role=switch]`; do not reintroduce peer/pseudo-element switches.
- Header actions live in `src/layout/header.tsx` (History, FileMenu,
  ExportButton). Dropdowns use `Menu` from `components/ui/menu.tsx`
  (popover-based; `Menu.Item` closes on select). Transient feedback goes
  through `useSettings().notify(message)` rendered by `components/toast.tsx`;
  prefer it over `window.alert` for success messages.
- Settings panels: `src/components/property/*.tsx`, registered in
  `property/index.tsx`. Panels are keyed by node id so local state resets on
  selection change.
- HTML export: `src/utils/export.ts` (`exportHtml(root, { minify })`). Follow
  the `email-html-compat` skill for anything you add there. Preview uses the
  same exporter in a sandboxed iframe.
- Pre-flight checks: `src/utils/lint.ts` `checkDocument(root)` returns
  `Issue[]` shown in the export dialog. Add a case there when a new block can
  ship broken (missing URL, embedded image, script tag...).
- Template library: `src/utils/library.ts` persists user templates in
  localStorage under `email-template-builder:library`.

## Add a new block type (checklist)

1. `packages/shared/src/types/common.ts`: add the name to `ComponentType`.
2. `packages/shared/src/types/properties.ts`: add `XProperties` and register it in `PropertiesOf`.
3. `packages/shared/src/types/components.ts`: add `XNode`.
4. `packages/shared/src/utils/factory.ts`: `xDefaults()` and an entry in `contentDefaults`.
5. `src/components/blocks.tsx`: icon, label and group in `blockMeta`
   (`content` for primitives, `section` for composed pieces like Product,
   Quote, Footer; the palette shows one collapsible per group).
6. `src/components/block/x.tsx`: editor renderer; add a `case` in `block/content.tsx`.
7. `src/components/property/x.tsx`: settings panel; register in `property/index.tsx`.
8. `src/utils/export.ts`: `renderX()` and a `case` in `renderContent`.
   Pass the block's properties as the 4th `wrap()` argument so visibility
   classes apply. Plain-text fields go through `escapeHtml`; rich HTML
   fields (Heading/Text/List/Table cells) are emitted raw.
8b. `src/utils/lint.ts`: add a `case` if the block can ship broken links,
   embedded images or missing legal text.
9. Optionally use it in `src/utils/templates.ts`.
10. `pnpm lint && pnpm build`.

## Server and AI (`apps/server`)

Full detail lives in the `nestjs-server` skill and `apps/server/CLAUDE.md`.
What the web side must know:

- NestJS + Prisma on PostgreSQL. Routes: `/api/health`,
  `/api/ai/{generate,refine,subjects,expand,rules,feedback,history}`,
  `/api/templates` (`?q=` semantic search, `?kind=`), `/:id`, `/:id/similar`,
  `/:id/screenshot`, `/:id/html`, `/:id/duplicate`. Errors are `{ error }`.
- Generation options: `type`, `tone`, `size` (`standard` | `large`), `brand`,
  `company`; bodies also take `history` (earlier chat prompts). Responses carry
  `engine` (`gemini` | `rules`), `dsl`, `root`, `html`, `summary` (the designer's
  note, shown as the chat reply), `references` (library templates shown to Gemini).
- Shared code is the `@mailwright/shared` package; keep DOM/Vite modules
  (api.ts, screenshot.ts, storage, selection) in `apps/web/src/utils` only.
- Web side: `utils/api.ts` (axios). The AI is a chat in the left sidebar
  (`components/chat.tsx`, state in `hooks/useChat.ts`). The site is public:
  one private conversation per browser (its id and the options live in
  localStorage; the server stores the turns for refinement context but never
  lists conversations). "New chat" deletes the current one. The UI never
  shows an AI vendor or model name (`/api/health` only says `ai: true|false`).
  `send()` creates a conversation on demand, shows the user message
  optimistically, then swaps in the server's user + assistant messages and
  context; the server decides intent (search / subjects / refine / generate /
  answer). Each generation card has a DSL toggle (`DslView`) and shows its
  references; the context bar
  shows the brief, applied changes, current DSL and a reset (server-side).
- Ads: `components/ads.tsx` (`AdSlot`) renders Google AdSense units only
  when `VITE_ADSENSE_CLIENT` and the slot id are set (see `.env.example`);
  placements: bottom of the left sidebar (`editor.tsx`) and above the library
  grid. `public/ads.txt` must carry the publisher line. Ad containers are
  `data-editor-only` so screenshots skip them.
- Template gallery (`components/library.tsx`) is read-only: keyword search,
  open, download HTML. There is no save/rename/delete anywhere (public site);
  `utils/screenshot.ts` and `html-to-image` are gone. Thumbnails are live
  scaled iframes of `/api/templates/:id/html` unless a row has a screenshot.
- Ads: `components/ads.tsx` (`AdSlot`) renders Google AdSense units only
  when `VITE_ADSENSE_CLIENT` and the slot id are set (see `.env.example`);
  placements: bottom of the left sidebar (`editor.tsx`) and above the library
  grid. `public/ads.txt` must carry the publisher line. Ad containers are
  `data-editor-only` so screenshots skip them.
- Template library (`components/library.tsx`) is server-only: debounced
  server keyword search (`listCloudTemplates({ q })`), screenshots via `captureCanvas()`
  (`html-to-image`; `data-editor-only` elements are skipped) with a live
  scaled iframe as fallback thumbnail.
- `utils/api-bridge.ts` exists only so the chat panel can import a few
  shared helpers without touching the barrel.

## Lint conventions that bite

- 4-space indent, single quotes, trailing commas, 80 cols (prettier owns formatting;
  prettier configs are LAST in `eslint.config.js` so they override the style rules).
- `no-nested-ternary`, `no-plusplus`, `no-shadow`, `react/no-array-index-key`
  (add a justified `eslint-disable-next-line` only when the list is truly index-keyed),
  `jsx-a11y/*` (interactive `div`s need `aria-hidden` or real roles; a component
  named `Link` is treated as an anchor, so alias icon imports).
- `@typescript-eslint/consistent-type-imports`: use `import type` for types.
- `react-refresh/only-export-components`: keep hooks/helpers out of `.tsx` files
  that export components (put hooks in `src/hooks`).
