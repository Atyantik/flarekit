import { describe, it, expect, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/d1";
import { getTestDatabase } from "./scripts/global-setup"; // Use the test database
import { createStorageRecord, getStorageRecordFromKey } from "../src/services/storage";
import { validate } from "uuid";

let db;

beforeEach(() => {
  db = drizzle(getTestDatabase()); // Use the database initialized by Miniflare
});

describe("Storage Service E2E Tests", () => {
  it("should create a new storage record", async () => {
    const newRecord = {
      key: "file-key",
      originalName: "test-file.txt",
      size: 1024,
      mimeType: "text/plain",
      hash: "hash-value",
    };

    const createdRecord = await createStorageRecord(newRecord, db);

    expect(createdRecord).toMatchObject({
      ...newRecord,
      id: expect.any(String), // Ensure UUID is generated
    });
  });

  it("should retrieve a storage record by key", async () => {
    const mockRecord = {
      key: "test-key",
      originalName: "test-file.txt",
      size: 2048,
      mimeType: "text/plain",
      hash: "hash-value",
    };

    // Insert mock record using createStorageRecord
    const createdRecord = await createStorageRecord(
      mockRecord,
      db,
    );

    // Retrieve the record using getStorageRecordFromKey
    const retrievedRecord = await getStorageRecordFromKey(
      "test-key",
      db,
    );

    // Validate all fields
    expect(retrievedRecord).toMatchObject({
      ...mockRecord, // Match the original fields
      id: createdRecord.id, // The id should match the created record
      createdAt: expect.any(String), // createdAt should be a string
      updatedAt: null, // updatedAt should be null
      deletedAt: null, // deletedAt should be null
    });

    expect(validate(createdRecord.id)).toBe(true); // Validate the UUID
  });

  it("should return null for a non-existent key", async () => {
    const retrievedRecord = await getStorageRecordFromKey("non-existent-key", db);
    expect(retrievedRecord).toBeNull();
  });
});
