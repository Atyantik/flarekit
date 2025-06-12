import { createExecutionContext, env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { BaseService } from '@/services/base.service';
import { initDBInstance, getInstance } from '@/index';
import { ServiceError } from '@/classes/service_error.class';

const ctx = createExecutionContext();
initDBInstance(ctx, env);
const instance = getInstance(ctx);
if (!instance) {
  throw new Error(
    'Ctx instance not found. Make sure initDatabase is implemented',
  );
}

const noSoftDeleteSchema = sqliteTable('no_soft_delete', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

const testService = new BaseService<
  typeof noSoftDeleteSchema.$inferInsert,
  typeof noSoftDeleteSchema.$inferSelect
>(noSoftDeleteSchema, instance as any);

describe('base.service bulkDelete', () => {
  it('should throw ServiceError when deletedAt column is missing', async () => {
    await expect(testService.bulkDelete(['1'])).rejects.toThrow(ServiceError);
  });
});
