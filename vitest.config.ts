import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    setupFiles: ['./__tests__/setup.ts'],
  },
  resolve: { tsconfigPaths: true },
});
