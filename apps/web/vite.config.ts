import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths(), tailwindcss()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: process.env.API_URL ?? 'http://localhost:8787',
                changeOrigin: true,
            },
        },
    },
});
