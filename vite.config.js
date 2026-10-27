import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const proxy = {
  '/api/parts': {
    target: 'http://api.favorit-parts.ru',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/parts/, '/hs/hsprice/'),
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { proxy },
  preview: { proxy },
  test: {
    environment: 'jsdom',
    include: ['Test/**/*.test.{js,jsx}'],
    setupFiles: ['./Test/setup.js'],
    env: { VITE_API_KEY: 'test-key' },
    restoreMocks: true,
  },
});
