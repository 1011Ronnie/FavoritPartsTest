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
  server: { proxy },
  preview: { proxy },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    env: { VITE_API_KEY: 'test-key' },
    restoreMocks: true,
  },
});
