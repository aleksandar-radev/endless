import { defineConfig, loadEnv } from 'vite';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  const isDebugBuild = mode === 'debug' || env.VITE_DEBUG_BUILD === 'true';
  const shouldObfuscate = isProduction && !isDebugBuild;
  // Disable minification when obfuscating to prevent breaking the string array rotation
  const shouldMinify = isProduction && !isDebugBuild && !shouldObfuscate;

  return {
    base: env.VITE_BASE_PATH || './',
    plugins: [
      shouldObfuscate &&
        obfuscatorPlugin({
          exclude: [/node_modules/],
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
      sourcemap: isDebugBuild,
      minify: shouldMinify ? 'terser' : false,
      terserOptions: shouldMinify
        ? {
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
        }
        : undefined,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = String(id).replace(/\\/g, '/');
            if (normalizedId.includes('/node_modules/')) return 'vendor';
            if (normalizedId.includes('/src/languages/')) return 'languages';
            return undefined;
          },
        },
      },
    },
    server: { open: true },
  };
});
