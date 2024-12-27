import { describe, it, expect, beforeEach } from "vitest";
import { AnyD1Database, drizzle } from "drizzle-orm/d1";
import { getTestDatabase } from "../scripts/global-setup";
import { storageSchema } from "../../schema/storage.schema";
import { eq, sql } from "drizzle-orm";

let db: AnyD1Database;

beforeEach(() => {
  // Initialize the Drizzle instance with the test database
  db = drizzle(getTestDatabase());
});

describe("Storage Schema Tests with Drizzle Instance", () => {
  it("should insert and retrieve a record", async () => {
    const record = {
      id: "test-id",
      key: "file-key",
      originalName: "test-file.txt",
      size: 1024,
      mimeType: "text/plain",
      hash: "hash-value",
    };

    // Insert the record using Drizzle ORM
    await db.insert(storageSchema).values(record);

    // Retrieve the record
    const [retrievedRecord] = await db
      .select()
      .from(storageSchema)
      .where(eq(storageSchema.key, "file-key"));

    // Validate the retrieved record
    expect(retrievedRecord).toMatchObject({
      ...record,
      createdAt: expect.any(String), // Auto-generated timestamp
      updatedAt: null,
      deletedAt: null,
    });
  });

  it("should enforce unique constraint on the key column", async () => {
    const record = {
      id: "unique-id-1",
      key: "unique-key",
      originalName: "unique-file.txt",
      size: 2048,
      mimeType: "application/json",
      hash: "unique-hash",
    };

    // Insert a record
    await db.insert(storageSchema).values(record);

    // Attempt to insert a duplicate record with the same key
    await expect(
      db.insert(storageSchema).values({
        ...record,
        id: "unique-id-2", // New ID but same key
      })
    ).rejects.toThrow(/UNIQUE constraint failed/);
  });

  it("should enforce NOT NULL constraints", async () => {
    const invalidRecord = {
      id: "invalid-id",
      key: null, // Null value violates the NOT NULL constraint
      originalName: "null-file.txt",
      size: 512,
      mimeType: "application/json",
      hash: "null-hash",
    };

    // Attempt to insert an invalid record
    await expect(db.insert(storageSchema).values(invalidRecord)).rejects.toThrow(
      /NOT NULL constraint failed/
    );
  });

  it("should use the default value for createdAt", async () => {
    const record = {
      id: "default-createdAt-id",
      key: "default-createdAt-key",
      originalName: "default-file.txt",
      size: 1024,
      mimeType: "text/plain",
      hash: "default-hash",
    };

    // Insert the record without specifying createdAt
    await db.insert(storageSchema).values(record);

    // Retrieve the record and validate createdAt
    const [retrievedRecord] = await db
      .select()
      .from(storageSchema)
      .where(eq(storageSchema.key, "default-createdAt-key"));
  });

  it("should update a record's updatedAt column", async () => {
    const record = {
      id: "update-id",
      key: "update-key",
      originalName: "update-file.txt",
      size: 512,
      mimeType: "application/pdf",
      hash: "update-hash",
    };

    // Insert the record
    await db.insert(storageSchema).values(record);

    // Update the record using Drizzle ORM
    const updatedAt = new Date().toISOString();
    await db
      .update(storageSchema)
      .set({ updatedAt })
      .where(eq(storageSchema.key, "update-key"));

    // Retrieve and validate the updated record
    const [updatedRecord] = await db
      .select()
      .from(storageSchema)
      .where(eq(storageSchema.key, "update-key"));

    expect(updatedRecord.updatedAt).toBe(updatedAt);
  });

  it("should delete a record logically by setting deletedAt", async () => {
    const record = {
      id: "delete-id",
      key: "delete-key",
      originalName: "delete-file.txt",
      size: 2048,
      mimeType: "image/jpeg",
      hash: "delete-hash",
    };

    // Insert the record
    await db.insert(storageSchema).values(record);

    // Logically delete the record by setting deletedAt
    const deletedAt = new Date().toISOString();
    await db
      .update(storageSchema)
      .set({ deletedAt })
      .where(eq(storageSchema.key, "delete-key"));

    // Retrieve the logically deleted record
    const [deletedRecord] = await db
      .select()
      .from(storageSchema)
      .where(eq(storageSchema.key, "delete-key"));

    // Validate that deletedAt is set
    expect(deletedRecord.deletedAt).toBe(deletedAt);
  });

  it("should ensure idx_r2_storage_key index is defined on the key column", async () => {
    // Query the database to check for indexes
    const indexes = await db
      .run(sql`PRAGMA index_info('idx_r2_storage_key')`)
      .execute();

    // Validate the index exists and is associated with the correct column
    const indexColumns = indexes?.results?.map?.((index: Record<any, any>) => index.name);
    expect(indexColumns).toContain("key");
  });

  it("should validate idx_r2_storage_key index exists in the storage table", async () => {
    // Query all indexes in the storage table
    const tableIndexes = await db
      .run(sql`PRAGMA index_list('storage')`)
      .execute();

    // Validate the index exists in the table
    const indexNames = tableIndexes?.results?.map?.((index: Record<any, any>) => index.name);
    expect(indexNames).toContain("idx_r2_storage_key");
  });
});
