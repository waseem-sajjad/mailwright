/**
 * The server compiles the web app's shared utils (types, factory, export).
 * One of them reads Vite's import.meta.env; declare its shape here so tsc
 * does not need Vite's client types.
 */
interface ImportMeta {
    readonly env: Record<string, string | undefined>;
}
