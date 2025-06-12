import { getTableName } from 'drizzle-orm';
import { storageSchema } from '@schema/storage.schema';
import { storageInfoSchema } from '@schema/storage_info.schema';

export const schemas = {
  [getTableName(storageSchema)]: storageSchema,
  [getTableName(storageInfoSchema)]: storageInfoSchema,
};
