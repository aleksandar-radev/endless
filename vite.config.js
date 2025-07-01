import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(({ mode }) => {
  const isNoObf = mode === 'noobf';
  return {
    base: process.env.VITE_BASE_PATH || '/',
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
