import { storageTable, type InsertStorageType } from "./schema/storage";
import { and, eq, isNull } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { v7 as uuidv7 } from "uuid";

/**
 * Creates a new file record in the database.
 * @param file - The file data to be inserted.
 * @param db - The Drizzle database instance.
 * @returns The inserted file data.
 * @throws Error if the insertion fails.
 */
export const createFile = async (
  file: Omit<InsertStorageType, "id">,
  db: DrizzleD1Database,
) => {
  try {
    const response = await db.insert(storageTable).values({
      ...file,
      id: uuidv7(),
    });
    if (response.success) {
      return {
        ...file,
        id: uuidv7(),
      }
    }
    throw response;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/**
 * Retrieves a file record from the database by its key.
 * @param key - The key of the file to retrieve.
 * @param db - The Drizzle database instance.
 * @returns The file data if found, otherwise null.
 * @throws Error if the retrieval fails.
 */
export const getFileFromKey = async (
  key: string,
  db: DrizzleD1Database,
) => {
  try {
    return (await db
      .select()
      .from(storageTable).where(
        and(
          eq(storageTable.key, key),
          isNull(storageTable.deletedAt),
        )
      )
      .limit(1))?.[0] || null;
  } catch (err) {
    console.error(err);
    throw err;
  }
};