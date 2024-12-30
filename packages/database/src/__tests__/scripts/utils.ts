import { join, dirname } from 'node:path';
import { AnyD1Database } from 'drizzle-orm/d1';
import { applyMigrations } from './migration-runner';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const execMigrations = async (db: AnyD1Database) => {
  await applyMigrations(db, join(__dirname, '..', '..', '..', 'migrations'));
};
