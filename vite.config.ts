import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const coingeckoProxy = {
  '/api/coingecko': {
    target: 'https://api.coingecko.com',
    changeOrigin: true,
    rewrite: (requestPath: string) => requestPath.replace(/^\/api\/coingecko/, '/api/v3'),
  },
};

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: coingeckoProxy,
      },
      preview: {
        proxy: coingeckoProxy,
      },
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
