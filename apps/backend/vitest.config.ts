import { readFile, readdir, stat } from 'node:fs/promises';
import tsconfigPaths from 'vite-tsconfig-paths';
import {
  defineWorkersConfig,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config';
import { join } from 'node:path';

const __dirname = new URL('.', import.meta.url).pathname;
const assetsPath = join(__dirname, 'test', 'assets');
const databasePackagePath = join(__dirname, '..', '..', 'packages', 'database');
const assets: Record<string, string> = {};

// Helper function to read files recursively
async function loadAssets(
  directory: string,
  assetsObj: Record<string, string>,
  basePath = '',
) {
  const entries = await readdir(directory);

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const relativePath = join(basePath, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      // If entry is a directory, recurse into it
      loadAssets(fullPath, assetsObj, relativePath);
    } else if (stats.isFile()) {
      // If entry is a file, read it as ArrayBuffer and store in assets object
      const fileData = await readFile(fullPath, { encoding: 'utf-8' });
      assetsObj[relativePath] = fileData;
    }
  }
}
await loadAssets(assetsPath, assets);

export default defineWorkersConfig(async (_) => {
  const migrationsPath = join(databasePackagePath, 'migrations');
  const migrations = await readD1Migrations(migrationsPath);

  return {
    test: {
      setupFiles: [join(databasePackagePath, 'test', 'apply-migrations.ts')],
      globals: true,
      poolOptions: {
        workers: {
          wrangler: {
            configPath: './wrangler.json',
          },
          miniflare: {
            // Add a test-only binding for migrations, so we can apply them in a
            // setup file
            bindings: {
              ASSETS: assets,
              TEST_MIGRATIONS: migrations,
            },
          },
        },
      },
      coverage: {
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
