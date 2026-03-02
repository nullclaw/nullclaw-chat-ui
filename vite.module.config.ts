import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        css: 'injected',
      },
    }),
  ],
  resolve: {
    alias: {
      '$lib': resolve('./src/lib'),
    },
  },
  build: {
    lib: {
      entry: resolve('./src/lib/module-entry.ts'),
      formats: ['es'],
      fileName: () => 'module.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
