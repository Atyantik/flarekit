import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnyD1Database, drizzle } from 'drizzle-orm/d1';
import { storageSchema } from '@schema/storage.schema';
import {
  createStorageRecord,
  getStorageRecordFromKey,
} from '@services/storage.service';
import { getTestDatabase } from '../scripts/global-setup';
import { v7 as uuidv7 } from 'uuid';
import { eq } from 'drizzle-orm';

vi.mock('uuid', () => ({
  v7: vi.fn(),
}));

let db: AnyD1Database;

beforeEach(() => {
  // Initialize the test database with Drizzle ORM
  db = drizzle(getTestDatabase());
  vi.resetAllMocks(); // Reset all mocks before each test
});

describe('Storage Service Tests', () => {
  describe('createStorageRecord', () => {
    it('should successfully create a storage record', async () => {
      const mockUuid = 'mock-uuid';
      const u7 = () => uuidv7();
      vi.mocked(u7).mockReturnValue(mockUuid);

      const newRecord = {
        key: 'file-key',
        originalName: 'test-file.txt',
        size: 1024,
        mimeType: 'text/plain',
        hash: 'hash-value',
      };

      // Create the record
      const createdRecord = await createStorageRecord(newRecord, db);

      // Validate the created record
      expect(createdRecord).toMatchObject({
        ...newRecord,
        id: mockUuid,
      });

      // Validate the record exists in the database
      const result = await db
        .select()
        .from(storageSchema)
        .where(eq(storageSchema.key, 'file-key'));

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        ...newRecord,
        id: mockUuid,
        createdAt: expect.any(String),
        updatedAt: null,
        deletedAt: null,
      });
    });

    it('should throw an error if the record creation fails', async () => {
      const invalidRecord = {
        key: null, // Null value violates NOT NULL constraint
        originalName: 'invalid-file.txt',
        size: 512,
        mimeType: 'application/json',
        hash: 'invalid-hash',
      };

      // Attempt to create an invalid record
      await expect(
        // @ts-expect-error we are testing the error case when key is null
        createStorageRecord(invalidRecord, db),
      ).rejects.toThrow();
    });
  });

  describe('getStorageRecordFromKey', () => {
    it('should retrieve a storage record by key', async () => {
      const mockRecord = {
        id: 'test-id',
        key: 'test-key',
        originalName: 'test-file.txt',
        size: 2048,
        mimeType: 'text/plain',
        hash: 'hash-value',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
        deletedAt: null,
      };

      // Insert the mock record
      await db.insert(storageSchema).values(mockRecord);

      // Retrieve the record
      const retrievedRecord = await getStorageRecordFromKey('test-key', db);

      // Validate the retrieved record
      expect(retrievedRecord).toMatchObject(mockRecord);
    });

    it('should return null if the record does not exist', async () => {
      const retrievedRecord = await getStorageRecordFromKey(
        'non-existent-key',
        db,
      );
      expect(retrievedRecord).toBeNull();
    });

    it('should throw an error if the query fails', async () => {
      // Mock an invalid database schema
      vi.spyOn(db, 'select').mockImplementationOnce(() => {
        throw new Error('Query failed');
      });

      await expect(getStorageRecordFromKey('test-key', db)).rejects.toThrow(
        'Query failed',
      );
    });
  });

  describe('createStorageRecord (Throw Scenario)', () => {
    it('should throw the response if insert fails', async () => {
      const mockUuid = 'mock-uuid';
      const u7 = () => uuidv7();
      vi.mocked(u7).mockReturnValue(mockUuid);

      const newRecord = {
        key: 'invalid-key', // Some valid mock data
        originalName: 'test-file.txt',
        size: 1024,
        mimeType: 'text/plain',
        hash: 'hash-value',
      };

      // Mock the `db.insert()` method to return a failed response
      vi.spyOn(db, 'insert').mockImplementation(() => ({
        values: vi.fn().mockReturnValueOnce({
          success: false, // Simulating failure
        }),
      }));

      // Ensure the function throws the response
      await expect(createStorageRecord(newRecord, db)).rejects.toThrow();

      // Restore the mocked implementation after the test
      vi.restoreAllMocks();
    });
  });
});
