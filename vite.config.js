import { defineConfig, loadEnv } from 'vite';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isNoObf = mode === 'noobf';

  return {
    base: env.VITE_BASE_PATH || './',
    plugins: [
      !isNoObf && obfuscatorPlugin({
        options: {
          rotateStringArray: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          stringArray: true,
          stringArrayThreshold: 0.8,
          identifierNamesGenerator: 'hexadecimal',
        },
      }),
    ].filter(Boolean),

    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: isNoObf ? false : 'terser',
      terserOptions: isNoObf ? undefined : {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: true,
        format: {
          comments: false,
        },
      },
    },
    server: {
      open: true,
    },
  };
});
