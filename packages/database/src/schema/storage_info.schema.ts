import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { storageSchema } from './storage.schema';

export const storageInfoSchema = sqliteTable(
  'storage_info',
  {
    id: text('id').primaryKey(),
    storageId: text('storage_id')
      .notNull()
      .references(() => storageSchema.id),
    description: text('description').notNull(),
    createdAt: text('created_at').default(sql`(current_timestamp)`),
  },
  (t) => [index('idx_storage_info_storage_id').on(t.storageId)],
);
