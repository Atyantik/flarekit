import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./src/__tests__/scripts/global-setup.ts'], // Add global setup here
    coverage: {
      exclude: ['./src/__tests__'], // Exclude test files from coverage
    },
  },
  plugins: [tsconfigPaths()],
});
