// types.ts
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export interface Ctx {
  db: DrizzleD1Database;
  cache?: KVNamespace;
  queue?: Queue<unknown>;
}
