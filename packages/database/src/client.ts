import { type AnyD1Database, drizzle, DrizzleD1Database } from 'drizzle-orm/d1';

const drizzleDBMap = new WeakMap<any, DrizzleD1Database>();

export const getDBClient = async (
  reference: any,
  DB: AnyD1Database,
): Promise<DrizzleD1Database> => {
  let drizzleInstance = drizzleDBMap.get(reference);
  if (drizzleInstance) {
    return drizzleInstance;
  }
  drizzleInstance = drizzle(DB);
  drizzleDBMap.set(reference, drizzleInstance);
  return drizzleInstance;
};
