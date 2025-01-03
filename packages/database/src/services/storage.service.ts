import {
  SelectStorageType,
  storageSchema,
  type InsertStorageType,
} from '@schema/storage.schema';
import { and, eq, isNull, desc } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import { Ctx } from '../types';

/**
 * Creates a new storage record in the database.
 * @param storageRecord - The storage record to create.
 * @param db - The Drizzle database instance.
 * @returns The created storage record.
 * @throws Error if the creation fails.
 */
export const createStorageRecord = async (
  storageRecord: Omit<InsertStorageType, 'id'>,
  ctx: Ctx,
) => {
  try {
    const uid = uuidv7();
    const response = await ctx.db.insert(storageSchema).values({
      ...storageRecord,
      id: uid,
    });
    if (response.success) {
      if (ctx.cache) {
        await ctx.cache.delete('storage_records');
      }
      return {
        ...storageRecord,
        id: uid,
      };
    }
    throw response;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/**
 * Retrieves a storage record from the database using the key.
 * @param key - The key of the storage record.
 * @param db - The Drizzle database instance.
 * @returns The storage record if found, otherwise null.
 * @throws Error if the retrieval fails.
 */
export const getStorageRecordFromKey = async (key: string, ctx: Ctx) => {
  try {
    return (
      (
        await ctx.db
          .select()
          .from(storageSchema)
          .where(
            and(eq(storageSchema.key, key), isNull(storageSchema.deletedAt)),
          )
          .limit(1)
      )?.[0] || null
    );
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/**
 * List all storage records in the database.
 * @param db - The Drizzle database instance.
 * @returns Array of all Storage Records.
 * @throws Error if the listing fails.
 */
export const listStorageRecords = async (
  ctx: Ctx,
): Promise<SelectStorageType[]> => {
  try {
    if (ctx.cache) {
      const cachedRecords = await ctx.cache.get('storage_records');
      if (cachedRecords) {
        try {
          return JSON.parse(cachedRecords) as SelectStorageType[];
        } catch {
          // do nothing - cache miss
        }
      }
    }
    const records = await ctx.db
      .select()
      .from(storageSchema)
      .where(isNull(storageSchema.deletedAt))
      .orderBy(desc(storageSchema.createdAt));

    if (ctx.cache) {
      await ctx.cache.put('storage_records', JSON.stringify(records));
    }
    return records;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/**
 * Clears the storage table.
 * @param db - The Drizzle database instance.
 * @returns The number of records deleted.
 * @throws Error if the deletion fails.
 */
export const clearStorageRecords = async (ctx: Ctx) => {
  try {
    return await ctx.db.delete(storageSchema);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
