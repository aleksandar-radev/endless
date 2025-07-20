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
    },
    assetsInclude: ['**/changelog/*.html'],
    server: {
      open: true,
    },
  };
});
