import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Mirrors the `@/*` path alias in tsconfig.json so tests import the same way
    // application code does.
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  test: {
    environment: 'node',
    // Scoped to src/tests so Vitest never picks up
    // scripts/listing-retention.contract.test.mjs, which is a node:test file
    // and is run separately with `node --test`.
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/features/**/utils/**'],
    },
  },
});
