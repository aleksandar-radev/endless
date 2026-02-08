import { defineConfig, loadEnv } from 'vite';
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isDebugBuild = mode === 'debug' || env.VITE_DEBUG_BUILD === 'true';

  const shouldObfuscate = isProduction && !isDebugBuild;
  const shouldMinify = isProduction && !isDebugBuild;

  return {
    base: env.VITE_BASE_PATH || './',

    build: {
      minify: shouldMinify ? 'terser' : 'esbuild',
      terserOptions: shouldMinify ? {
        compress: { drop_console: true, drop_debugger: true },
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
      shouldObfuscate && vitePluginBundleObfuscator({
        enable: true,
        log: true,
        autoExcludeNodeModules: true, // CRITICAL: Keeps libraries safe

        options: {
          controlFlowFlattening: false,
          deadCodeInjection: false,
          selfDefending: false,
          identifierNamesGenerator: 'mangled',
          splitStrings: false,
          compact: true,
          stringArray: false,
          stringArrayEncoding: [],
          stringArrayThreshold: 0,
          debugProtection: false,
          // debugProtectionInterval: 10000,
          renameGlobals: false,
          renameProperties: false,
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
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
          maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html}'],
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