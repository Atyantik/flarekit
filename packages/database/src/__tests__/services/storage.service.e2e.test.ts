import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnyD1Database, drizzle } from 'drizzle-orm/d1';
import { storageSchema } from '@schema/storage.schema';
import {
  clearStorageRecords,
  createStorageRecord,
  getStorageRecordFromKey,
  listStorageRecords,
} from '@services/storage.service';
import { getTestDatabase } from '../scripts/global-setup';
import { v7 as uuidv7 } from 'uuid';
import { eq } from 'drizzle-orm';

vi.mock('uuid', () => ({
  v7: vi.fn(),
}));

let db: AnyD1Database;

beforeEach(async () => {
  // Initialize the test database with Drizzle ORM
  db = drizzle(getTestDatabase());
  vi.resetAllMocks(); // Reset all mocks before each test

  // Optionally, clear existing data from the table to ensure each test starts clean
  await db.delete(storageSchema);
});

describe('Storage Service Tests', () => {
  describe('createStorageRecord', () => {
    it('should successfully create a storage record', async () => {
      const mockUuid = 'mock-uuid';
      vi.mocked(uuidv7 as () => string).mockReturnValue(mockUuid);

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
      vi.mocked(uuidv7 as () => string).mockReturnValue(mockUuid);

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

  describe('listStorageRecords', () => {
    it('should return an empty array if no records exist', async () => {
      // listStorageRecords should return []
      const records = await listStorageRecords(db);
      expect(records).toEqual([]);
    });

    it('should return all records that are not deleted', async () => {
      const mockRecords = [
        {
          id: 'record-1',
          key: 'key-1',
          originalName: 'file1.txt',
          size: 100,
          mimeType: 'text/plain',
          hash: 'hash1',
          createdAt: new Date().toISOString(),
          updatedAt: null,
          deletedAt: null,
        },
        {
          id: 'record-2',
          key: 'key-2',
          originalName: 'file2.txt',
          size: 200,
          mimeType: 'text/plain',
          hash: 'hash2',
          createdAt: new Date().toISOString(),
          updatedAt: null,
          deletedAt: null,
        },
      ];

      // Insert multiple records
      await db.insert(storageSchema).values(mockRecords);

      // Retrieve them
      const records = await listStorageRecords(db);

      // Expect to find both since none are deleted
      expect(records).toHaveLength(2);
      expect(records).toEqual(
        expect.arrayContaining([
          expect.objectContaining(mockRecords[0]),
          expect.objectContaining(mockRecords[1]),
        ]),
      );
    });

    it('should not return records that have a non-null deletedAt', async () => {
      const mockRecord = {
        id: 'record-deleted',
        key: 'deleted-key',
        originalName: 'file-deleted.txt',
        size: 300,
        mimeType: 'text/plain',
        hash: 'hash3',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        // Mark it as deleted
        deletedAt: new Date().toISOString(),
      };

      const activeRecord = {
        id: 'record-active',
        key: 'active-key',
        originalName: 'file-active.txt',
        size: 400,
        mimeType: 'text/plain',
        hash: 'hash4',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        deletedAt: null,
      };

      // Insert both a soft-deleted record and an active record
      await db.insert(storageSchema).values([mockRecord, activeRecord]);

      // listStorageRecords should only return the active record
      const records = await listStorageRecords(db);
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject(activeRecord);
    });

    it('should throw an error if the query fails', async () => {
      // Mock (or spy on) db.select() so it throws an error
      vi.spyOn(db, 'select').mockImplementationOnce(() => {
        throw new Error('List records query failed');
      });

      // Because listStorageRecords() re-throws the error,
      // we expect the promise to reject
      await expect(listStorageRecords(db)).rejects.toThrow(
        'List records query failed',
      );
    });
  });

  describe('clearStorageRecords', () => {
    it('should return an empty array after clearing the storage', async () => {
      // listStorageRecords should return []
      const mockRecords = [
        {
          id: 'record-1',
          key: 'key-1',
          originalName: 'file1.txt',
          size: 100,
          mimeType: 'text/plain',
          hash: 'hash1',
          createdAt: new Date().toISOString(),
          updatedAt: null,
          deletedAt: null,
        },
        {
          id: 'record-2',
          key: 'key-2',
          originalName: 'file2.txt',
          size: 200,
          mimeType: 'text/plain',
          hash: 'hash2',
          createdAt: new Date().toISOString(),
          updatedAt: null,
          deletedAt: null,
        },
      ];
      // Insert multiple records
      await db.insert(storageSchema).values(mockRecords);
      // Retrieve them
      const records = await listStorageRecords(db);

      // Expect to find both since none are deleted
      expect(records).toHaveLength(2);
      clearStorageRecords(db);

      const postDeletedRecords = await listStorageRecords(db);
      expect(postDeletedRecords).toHaveLength(0);
    });

    it('should throw an error if the delete fails', async () => {
      // Mock (or spy on) db.select() so it throws an error
      vi.spyOn(db, 'delete').mockImplementationOnce(() => {
        throw new Error('Delete records query failed');
      });

      // Because listStorageRecords() re-throws the error,
      // we expect the promise to reject
      await expect(clearStorageRecords(db)).rejects.toThrow(
        'Delete records query failed',
      );
    });
  });
});
