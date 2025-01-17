import tsconfigPaths from 'vite-tsconfig-paths';
import {
  defineWorkersConfig,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config';
import { join } from 'node:path';
import { configDefaults } from 'vitest/config';

const __dirname = new URL('.', import.meta.url).pathname;

export default defineWorkersConfig(async (_) => {
  const migrationsPath = join(__dirname, 'migrations');
  const migrations = await readD1Migrations(migrationsPath);
  return {
    test: {
      globals: true,
      setupFiles: ['./test/apply-migrations.ts'],
      poolOptions: {
        workers: {
          wrangler: {
            configPath: './wrangler.json',
          },
          miniflare: {
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
      coverage: {
        exclude: [...(configDefaults?.coverage?.exclude ?? []), './scripts'],
        provider: 'istanbul',
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
    },
    plugins: [tsconfigPaths()],
  };
});
