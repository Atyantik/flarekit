import { getTableName } from 'drizzle-orm';
import { storageSchema } from '@schema/storage.schema';

export const schemas = {
  [getTableName(storageSchema)]: storageSchema,
};
