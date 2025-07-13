import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isNoObf = mode === 'noobf';
  return {
    base: env.VITE_BASE_PATH || './',
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
    buildEnd: async () => {
      if (!isNoObf && mode === 'production') {
        const { execSync } = await import('child_process');
        execSync('node obfuscate-dist.js', { stdio: 'inherit' });
      }
    },
  };
});
