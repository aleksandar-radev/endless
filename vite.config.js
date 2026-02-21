import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isDebugBuild = mode === 'debug' || env.VITE_DEBUG_BUILD === 'true';

  const shouldMinify = isProduction && !isDebugBuild;

  return {
    base: env.VITE_BASE_PATH || './',

    build: {
      minify: shouldMinify ? 'terser' : 'esbuild',
      terserOptions: shouldMinify ? {
        compress: { drop_console: false, drop_debugger: false },
        format: { comments: false },
      } : undefined,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('/src/languages/')) {
              return 'languages';
            }
          },
        },
      },
    },

    plugins: [
      createHtmlPlugin({
        inject: {
          data: {
            VITE_ENV: env.VITE_ENV || 'production',
            VITE_SHOW_ADS: env.VITE_SHOW_ADS || '0',
          },
        },
      }),
      VitePWA({
        registerType: 'prompt',
        devOptions: { enabled: true },
        includeAssets: ['endless192x192.jpg', 'endless512x512.jpg'],
        manifest: {
          name: 'Endless',
          short_name: 'Endless',
          description: 'An epic idle RPG adventure with unique classes and deep progression.',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          start_url: './',
          icons: [
            {
              src: 'endless192x192.jpg',
              sizes: '192x192',
              type: 'image/jpeg',
            },
            {
              src: 'endless512x512.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
          globPatterns: ['**/*.{js,css}'],
          navigateFallbackDenylist: [/./],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  };
});