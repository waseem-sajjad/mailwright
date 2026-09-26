# Email Template Builder

Drag-and-drop email designer that exports table-based, inbox-safe HTML.
Vite + React 19 + TypeScript + Zustand + dnd-kit + Tailwind 4. Package manager is pnpm.

## Commands

- `pnpm dev` – dev server on port 3000
- `pnpm build` – `tsc -b && vite build`; must pass
- `pnpm lint` – must exit 0; fix with `npx eslint . --fix && npx prettier --write "src/**/*.{ts,tsx}"`

## Layout

- `src/types` – `EmailNode` tree types and every block's properties
- `src/utils` – `tree.ts` (immutable tree ops), `factory.ts` (defaults, layouts,
  `normalizeNode` migration), `export.ts` (HTML exporter), `templates.ts`
  (starter templates), `library.ts` (saved templates), `lint.ts` (pre-flight
  checks), `mergeTags.ts`, `storage.ts`
- `src/hooks` – `useEmail` (document + undo/redo + autosave), `useSettings`
  (view, dialogs, drag state), `useShortcuts`, `useNodeProps`
- `src/components/block` – canvas renderers; `property` – settings panels;
  `ui` – primitives; `dnd.tsx`, `slot.tsx`, `container.tsx` – drag/drop plumbing
- `src/layout` – shell: sidebars, header toolbar, canvas

## Skills

- `email-builder-dev` – architecture, store rules, add-a-block checklist, lint gotchas. Load before editing `src/`.
- `email-html-compat` – rules for `export.ts` so output survives Outlook and Gmail.

## Rules

- Never mutate nodes; use `src/utils/tree.ts` helpers.
- Keystroke-level edits go through `setTransient` + `commit()` so undo stays sane.
- Any new property needs a factory default; every document load goes through `normalizeNode`.
- Prettier owns formatting; keep its configs last in `eslint.config.js`.

## Shared package

`@/types` and `@/utils` re-export `@email-builder/shared` (`packages/shared`):
the document model, factories, tree ops, exporter, starters, merge-tag helpers
and pre-flight checks now live there. Edit them in the package; DOM-bound
helpers (`cn`, `storage`, `selection`, `mergeTagDom`, `api`, `screenshot`)
stay here.

## Public site

One private AI conversation per browser (no history list), no vendor or model
names in the UI, Google AdSense slots via `components/ads.tsx` when
`VITE_ADSENSE_CLIENT` is set (`.env.example`, `public/ads.txt`).
