# @mailwright/shared

Pure, DOM-free code used by both `apps/web` and `apps/server`: the `EmailNode`
document model and property types (`src/types`), factories and defaults
(`utils/factory.ts`), tree operations (`utils/tree.ts`), the HTML exporter
(`utils/export.ts`, follow the `email-html-compat` skill), starter templates,
merge-tag helpers and pre-flight checks (`utils/lint.ts`).

Rules: nothing here may touch `window`, `document`, `localStorage`, Vite or
React at import time (the server bundles it). Consumers import
`@mailwright/shared/types` and `@mailwright/shared/utils`; the web app
re-exports them from `@/types` and `@/utils` so component code is unchanged.
Verify with `pnpm lint` here plus both apps' builds.
