import { storageSchema, type InsertStorageType } from '@schema/storage.schema';
import { and, eq, isNull } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { v7 as uuidv7 } from 'uuid';

/**
 * Creates a new storage record in the database.
 * @param storageRecord - The storage record to create.
 * @param db - The Drizzle database instance.
 * @returns The created storage record.
 * @throws Error if the creation fails.
 */
export const createStorageRecord = async (
  storageRecord: Omit<InsertStorageType, 'id'>,
  db: DrizzleD1Database,
) => {
  try {
    const uid = uuidv7();
    const response = await db.insert(storageSchema).values({
      ...storageRecord,
      id: uid,
    });
    if (response.success) {
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
export const getStorageRecordFromKey = async (
  key: string,
  db: DrizzleD1Database,
) => {
  try {
    return (
      (
        await db
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
export const listStorageRecords = async (db: DrizzleD1Database) => {
  try {
    return await db
      .select()
      .from(storageSchema)
      .where(isNull(storageSchema.deletedAt));
  } catch (err) {
    console.error(err);
    throw err;
  }
};
