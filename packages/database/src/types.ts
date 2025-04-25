// types.ts
import { storageSchema } from '@schema/storage.schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export interface Ctx {
  db: DrizzleD1Database<{
    [storageSchema._.name]: typeof storageSchema;
  }>;
}
