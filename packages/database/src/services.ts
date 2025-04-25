import { getTableName } from 'drizzle-orm';
import { Ctx } from './types';
import { BaseService } from './services/base.service';
import { storageSchema } from './schema/storage.schema';

export const services = (ctx: Ctx) => ({
  [getTableName(storageSchema)]: new BaseService<
    typeof storageSchema.$inferInsert,
    typeof storageSchema.$inferSelect
  >(storageSchema, ctx),
});
