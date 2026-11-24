import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'push-sw.js',
        ],
        manifest: {
          id: '/',
          name: 'GM-Empréstimo',
          short_name: 'GMEmprestimo',
          description: 'Formulário completo para cadastro de clientes e gestão GM-Empréstimo.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          lang: 'pt-BR',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          importScripts: ['/push-sw.js'],
          cleanupOutdatedCaches: true,
          globPatterns: ['**/*.{js,css,ico,png,svg,woff,woff2}'],
          globIgnores: [
            '**/index.html',
            '**/html2pdf*',
            '**/html2canvas*',
            '**/purify*',
            '**/jspdf*',
            '**/pdfExport*',
            '**/index.es-*',
            '**/*.map',
          ],
          navigateFallback: null,
          runtimeCaching: [
            {
              urlPattern: ({request}) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'gm-pages-cache',
                networkTimeoutSeconds: 4,
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'classic',
          suppressWarnings: true,
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
