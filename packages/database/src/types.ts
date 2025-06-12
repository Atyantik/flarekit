// types.ts
import { storageSchema } from '@schema/storage.schema';
import { storageInfoSchema } from '@schema/storage_info.schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export interface Ctx {
  db: DrizzleD1Database<{
    [storageSchema._.name]: typeof storageSchema;
    [storageInfoSchema._.name]: typeof storageInfoSchema;
  }>;
}
