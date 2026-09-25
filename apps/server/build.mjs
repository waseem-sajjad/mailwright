// Bundles the server with esbuild's JS API (the CLI shim breaks under pnpm
// once the native binary replaces the JS stub).
import { build } from 'esbuild';

await build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    // Bundle everything (including the web app's helpers and their deps) except
    // the server's own runtime packages and Node built-ins.
    external: ['express', 'cors', 'axios', 'zod', 'nanoid', 'node:*'],
    alias: { '@': '../web/src' },
    outfile: 'dist/index.mjs',
    logLevel: 'info',
});
