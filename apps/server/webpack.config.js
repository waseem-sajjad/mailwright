// Nest's default webpack config, with the workspace package bundled instead of
// treated as an external (its source is TypeScript and lives outside node_modules).
const nodeExternals = require('webpack-node-externals');

module.exports = (options) => ({
    ...options,
    externals: [nodeExternals({ allowlist: [/^@email-builder\//] })],
});
