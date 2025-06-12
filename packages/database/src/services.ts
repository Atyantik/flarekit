import { getTableName, eq } from 'drizzle-orm';
import { Ctx } from './types';
import { BaseService } from './services/base.service';
import { storageSchema } from './schema/storage.schema';
import { storageInfoSchema } from './schema/storage_info.schema';

export const services = (ctx: Ctx) => ({
  [getTableName(storageSchema)]: new BaseService<
    typeof storageSchema.$inferInsert,
    typeof storageSchema.$inferSelect
  >(storageSchema, ctx),
  [getTableName(storageInfoSchema)]: new BaseService<
    typeof storageInfoSchema.$inferInsert,
    typeof storageInfoSchema.$inferSelect
  >(storageInfoSchema, ctx, [
    {
      schema: storageSchema,
      on: (info: any, storage: any) => eq(info.storageId, storage.id),
    },
  ]),
});
