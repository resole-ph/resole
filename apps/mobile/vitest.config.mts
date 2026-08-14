import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Mirrors the `@/*` path alias in tsconfig.json so tests import the same way
    // application code does.
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  test: {
    // Everything covered here is plain TypeScript with no React Native imports,
    // so the node environment is enough — no jest-expo preset required.
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/features/**/utils/**', 'src/features/**/validation.ts'],
    },
  },
});
