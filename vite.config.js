import { defineConfig, loadEnv } from 'vite';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    base: env.VITE_BASE_PATH || './',
    plugins: [
      isProduction && obfuscatorPlugin({
        options: {
          rotateStringArray: true,
          stringArray: true,
          stringArrayThreshold: 1,
          identifierNamesGenerator: 'hexadecimal',
          compact: true,
          deadCodeInjection: false,
          controlFlowFlattening: false,
        },
      }),
    ].filter(Boolean),

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 3,
        },
        mangle: true,
        format: {
          comments: false,
          beautify: false,
          max_line_len: false,
        },
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = String(id).replace(/\\/g, '/');
            if (normalizedId.includes('/node_modules/')) return 'vendor';
            if (normalizedId.includes('/src/languages/')) return 'languages';
            if (normalizedId.includes('/src/constants/skills/')) return 'constants-skills';
            if (normalizedId.includes('/src/constants/quests/')) return 'constants-quests';
            if (normalizedId.includes('/src/constants/enemies/')) return 'constants-enemies';
            if (normalizedId.includes('/src/constants/rocky_field_enemies/')) return 'constants-rocky-field-enemies';
            if (normalizedId.includes('/src/constants/stats/')) return 'constants-stats';
            if (normalizedId.endsWith('/src/constants/items.js')) return 'constants-items';
            if (normalizedId.endsWith('/src/constants/materials.js')) return 'constants-materials';
            if (normalizedId.endsWith('/src/constants/regions.js')) return 'constants-regions';
            if (normalizedId.endsWith('/src/constants/specializations.js')) return 'constants-specializations';
            if (normalizedId.endsWith('/src/constants/uniqueSets.js')) return 'constants-unique-sets';
            if (normalizedId.endsWith('/src/constants/runes.js')) return 'constants-runes';
            if (normalizedId.endsWith('/src/constants/bosses.js')) return 'constants-bosses';
            if (normalizedId.includes('/src/constants/')) return 'constants-core';
            if (normalizedId.includes('/src/ui/')) return 'ui';
            if (normalizedId.includes('/src/migrations/')) return 'migrations';
            return undefined;
          },
        },
      },
    },
    server: {
      open: true,
    },
  };
});
