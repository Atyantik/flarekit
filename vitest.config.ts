import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['apps/web', 'dist', 'node_modules', 'tests'],
    coverage: {
      provider: 'istanbul', // or 'v8'
      include: [
        '**/src/**/*.{ts,js}', // Include only src directories in all workspaces
      ],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'apps/web', // Temporary exclude web app
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
});
