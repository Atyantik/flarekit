import tsconfigPaths from 'vite-tsconfig-paths';
import {
  defineWorkersConfig,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config';
import { dirname, join } from 'node:path';
import { configDefaults } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
      },
    },
    plugins: [tsconfigPaths()],
  };
});
