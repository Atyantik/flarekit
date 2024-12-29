import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./src/__tests__/scripts/global-setup.ts'], // Add global setup here
    coverage: {
      provider: 'istanbul',
      exclude: [
        '**/dist/**', // Exclude dist directories
        '**/tests/**', // Exclude tests directories
        '**/__tests__/**', // Exclude tests directories
        '**/*.test.{ts,js}', // Exclude test files
        '**/*.d.ts', // Exclude TypeScript declaration files
        'node_modules/**', // Exclude dependencies
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  plugins: [tsconfigPaths()],
});
