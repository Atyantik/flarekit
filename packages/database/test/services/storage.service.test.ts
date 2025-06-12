import { createExecutionContext, env } from 'cloudflare:test';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { getInstance, initDBInstance } from '@/index';
import { validate } from 'uuid';
import { ServiceError } from '@/classes/service_error.class';
import { toSQLiteUTCString } from '@/utils/date.util';

const ctx = createExecutionContext();
const db = initDBInstance(ctx, env);

const getTimestamp = (date: string | Date | null) => {
  if (!date) return 0;
  return new Date(date).getTime();
};

describe('storage.service', () => {
  afterEach(() => {
    // Reset mocks between tests
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('Create storage records', () => {
    it('Should create a new storage record with a generated UUID and return it', async () => {
      const input = {
        key: 'test-key',
        originalName: 'test.txt',
        size: 123,
        mimeType: 'text/plain',
        hash: 'somehash',
      };

      const result = await db.storage.create(input);
      expect(validate(result.id)).toBe(true);
    });

    it('Should throw an error if insertion fails', async () => {
      const input = {
        key: 'bad-key',
        originalName: 'bad.txt',
        size: 999,
        mimeType: 'text/plain',
        hash: 'bad-hash',
      };
      const instance = getInstance(ctx);
      if (!instance) {
        throw new Error(
          'Ctx instance not found. Make sure initDatabase is implemented',
        );
      }

      vi.spyOn(instance.db, 'insert').mockImplementation(() => {
        throw new Error('DB Insert Failed');
      });

      await expect(db.storage.create(input)).rejects.toThrow(
        'DB Insert Failed',
      );
    });

    it('Should handle date fields correctly', async () => {
      const now = new Date().toISOString();
      const input = {
        key: 'test-key',
        originalName: 'test.txt',
        size: 123,
        mimeType: 'text/plain',
        hash: 'somehash',
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      const nowDateSqlite = toSQLiteUTCString(now);

      const result = await db.storage.create(input);
      expect(result.createdAt).toEqual(nowDateSqlite);
      expect(result.updatedAt).toEqual(nowDateSqlite);
      expect(result.deletedAt).toBeNull();
    });
  });

  describe('Update storage records', () => {
    it('Should update an existing storage record', async () => {
      const input = {
        key: 'test-key',
        originalName: 'test.txt',
        size: 123,
        mimeType: 'text/plain',
        hash: 'somehash',
      };

      const record = await db.storage.create(input);
      // Use vi.advanceTimersByTime to simulate time passing
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000); // Advance by 1 second
      const updatedRecord = await db.storage.update(record.id, {
        originalName: 'updated.txt',
        size: 456,
      });
      vi.useRealTimers();
      expect(updatedRecord.originalName).toBe('updated.txt');
      expect(updatedRecord.size).toBe(456);
      expect(getTimestamp(updatedRecord.updatedAt)).toBeGreaterThan(
        getTimestamp(record.updatedAt),
      );
    });

    it('Should throw error when updating non-existent record', async () => {
      await expect(
        db.storage.update('non-existent-id', { originalName: 'test.txt' }),
      ).rejects.toThrow(ServiceError);
    });

    it('Should handle date fields in update', async () => {
      const input = {
        key: 'test-key',
        originalName: 'test.txt',
        size: 123,
        mimeType: 'text/plain',
        hash: 'somehash',
      };

      const record = await db.storage.create(input);
      const now = new Date().toISOString();
      const updatedRecord = await db.storage.update(record.id, {
        updatedAt: now,
      });

      expect(updatedRecord.updatedAt).toEqual(toSQLiteUTCString(now));
    });
  });

  describe('Delete storage records', () => {
    it('Should soft delete a record', async () => {
      const input = {
        key: 'test-key',
        originalName: 'test.txt',
        size: 123,
        mimeType: 'text/plain',
        hash: 'somehash',
      };

      const record = await db.storage.create(input);
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000); // Advance by 1 second
      const deletedRecord = await db.storage.delete(record.id);
      vi.useRealTimers();

      expect(getTimestamp(deletedRecord.deletedAt)).toBeGreaterThan(
        getTimestamp(record.createdAt),
      );
    });

    it('Should permanently delete a record', async () => {
      const input = {
        key: 'test-key',
        originalName: 'test.txt',
        size: 123,
        mimeType: 'text/plain',
        hash: 'somehash',
      };

      const record = await db.storage.create(input);
      await db.storage.delete(record.id, true);

      const deletedRecord = await db.storage.getById(record.id, true);
      expect(deletedRecord).toBeNull();
    });

    it('Should throw error when deleting non-existent record', async () => {
      await expect(db.storage.delete('non-existent-id')).rejects.toThrow(
        ServiceError,
      );
    });
  });

  describe('Get storage records', () => {
    it('Should get record by id', async () => {
      const input = {
        key: 'test-key',
        originalName: 'test.txt',
        size: 123,
        mimeType: 'text/plain',
        hash: 'somehash',
      };

      const record = await db.storage.create(input);
      const foundRecord = await db.storage.getById(record.id);

      expect(foundRecord).toBeDefined();
      expect(foundRecord?.id).toBe(record.id);
    });

    it('Should return null for non-existent id', async () => {
      const foundRecord = await db.storage.getById('non-existent-id');
      expect(foundRecord).toBeNull();
    });
  });

  describe('Get many records', () => {
    it('should fetch multiple records by id', async () => {
      const r1 = await db.storage.create({
        key: 'many-1',
        originalName: 'f1',
        size: 1,
        mimeType: 'text/plain',
        hash: 'h1',
      });
      const r2 = await db.storage.create({
        key: 'many-2',
        originalName: 'f2',
        size: 2,
        mimeType: 'text/plain',
        hash: 'h1',
      });

      const records = await db.storage.getMany([r1.id, r2.id]);
      expect(records.map((r) => r.id).sort()).toEqual([r1.id, r2.id].sort());
    });

    it('should filter by reference field', async () => {
      const h = 'refhash';
      const a = await db.storage.create({
        key: 'ref-1',
        originalName: 'f1',
        size: 1,
        mimeType: 'text/plain',
        hash: h,
      });
      await db.storage.create({
        key: 'ref-2',
        originalName: 'f2',
        size: 2,
        mimeType: 'text/plain',
        hash: h,
      });
      await db.storage.create({
        key: 'ref-3',
        originalName: 'f3',
        size: 3,
        mimeType: 'text/plain',
        hash: 'other',
      });

      const refRecords = await db.storage.getManyReference('hash', h);
      expect(refRecords.length).toBe(2);
      expect(refRecords.some((r) => r.id === a.id)).toBe(true);
    });
  });

  describe('Get Storage List', () => {
    it('Should list all active (non-deleted) records in descending order of createdAt', async () => {
      const input = {
        key: 'test-key-1',
        originalName: 'somefile',
        size: 100,
        mimeType: 'application/json',
        hash: 'zzz',
      };
      const input2 = {
        key: 'test-key-2',
        originalName: 'somefile',
        size: 100,
        mimeType: 'application/json',
        hash: 'aaa',
      };
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000); // Advance by 1 second
      const record1 = await db.storage.create(input);
      vi.advanceTimersByTime(1000); // Advance by 1 second
      const record2 = await db.storage.create(input2);
      vi.useRealTimers();

      // Sort by desc as default
      const result = await db.storage.getList();

      expect(result).toHaveLength(2);
      expect(result[1].id).eq(record1.id);
      expect(result[0].id).eq(record2.id);
      // check if the records are in descending order of createdAt
      expect(getTimestamp(result[0].createdAt)).toBeGreaterThan(
        getTimestamp(result[1].createdAt),
      );
    });

    it('Should get count of records', async () => {
      const input = {
        key: 'test-key-1',
        originalName: 'somefile',
        size: 100,
        mimeType: 'application/json',
        hash: 'zzz',
      };
      const input2 = {
        key: 'test-key-2',
        originalName: 'somefile',
        size: 100,
        mimeType: 'application/json',
        hash: 'aaa',
      };
      await db.storage.create(input);
      await db.storage.create(input2);

      const count = await db.storage.getCount();
      expect(count).toBe(2);
    });

    it('Should filter records by key', async () => {
      const input1 = {
        key: 'test-key-1',
        originalName: 'file1.txt',
        size: 100,
        mimeType: 'text/plain',
        hash: 'zzz',
      };
      const input2 = {
        key: 'test-key-2',
        originalName: 'file2.txt',
        size: 200,
        mimeType: 'text/plain',
        hash: 'aaa',
      };

      await db.storage.create(input1);
      await db.storage.create(input2);

      const filteredRecords = await db.storage.getList(undefined, undefined, {
        key: 'test-key-1',
      });
      expect(filteredRecords).toHaveLength(1);
      expect(filteredRecords[0].key).toBe('test-key-1');
    });

    it('Should sort records by size', async () => {
      const input1 = {
        key: 'test-key-1',
        originalName: 'file1.txt',
        size: 100,
        mimeType: 'text/plain',
        hash: 'zzz',
      };
      const input2 = {
        key: 'test-key-2',
        originalName: 'file2.txt',
        size: 200,
        mimeType: 'text/plain',
        hash: 'aaa',
      };

      await db.storage.create(input1);
      await db.storage.create(input2);

      const sortedRecords = await db.storage.getList(undefined, [
        'size',
        'ASC',
      ]);
      expect(sortedRecords[0].size).toBe(100);
      expect(sortedRecords[1].size).toBe(200);
    });

    it('Should get count with filter', async () => {
      const input1 = {
        key: 'test-key-1',
        originalName: 'file1.txt',
        size: 100,
        mimeType: 'text/plain',
        hash: 'zzz',
      };
      const input2 = {
        key: 'test-key-2',
        originalName: 'file2.txt',
        size: 200,
        mimeType: 'text/plain',
        hash: 'aaa',
      };

      await db.storage.create(input1);
      await db.storage.create(input2);

      const count = await db.storage.getCount({ key: 'test-key-1' });
      expect(count).toBe(1);
    });
  });

  describe('Bulk operations', () => {
    it('Should bulk update records', async () => {
      const input1 = {
        key: 'test-key-1',
        originalName: 'file1.txt',
        size: 100,
        mimeType: 'text/plain',
        hash: 'zzz',
      };
      const input2 = {
        key: 'test-key-2',
        originalName: 'file2.txt',
        size: 200,
        mimeType: 'text/plain',
        hash: 'aaa',
      };

      const record1 = await db.storage.create(input1);
      const record2 = await db.storage.create(input2);

      const updates = [
        { id: record1.id, data: { originalName: 'updated1.txt' } },
        { id: record2.id, data: { originalName: 'updated2.txt' } },
      ];

      const updatedRecords = await db.storage.bulkUpdate(updates);
      expect(updatedRecords).toHaveLength(2);
      expect(updatedRecords[0].originalName).toBe('updated1.txt');
      expect(updatedRecords[1].originalName).toBe('updated2.txt');
    });

    it('Should handle bulk update with non-existent records', async () => {
      const updates = [
        { id: 'non-existent-1', data: { originalName: 'updated1.txt' } },
        { id: 'non-existent-2', data: { originalName: 'updated2.txt' } },
      ];

      await expect(db.storage.bulkUpdate(updates)).rejects.toThrow(
        ServiceError,
      );
    });

    it('Should bulk delete records', async () => {
      const input1 = {
        key: 'test-key-1',
        originalName: 'file1.txt',
        size: 100,
        mimeType: 'text/plain',
        hash: 'zzz',
      };
      const input2 = {
        key: 'test-key-2',
        originalName: 'file2.txt',
        size: 200,
        mimeType: 'text/plain',
        hash: 'aaa',
      };

      const record1 = await db.storage.create(input1);
      const record2 = await db.storage.create(input2);

      const deletedRecords = await db.storage.bulkDelete([
        record1.id,
        record2.id,
      ]);
      expect(deletedRecords).toHaveLength(2);
      expect(deletedRecords[0].deletedAt).toBeDefined();
      expect(deletedRecords[1].deletedAt).toBeDefined();
    });

    it('Should handle bulk delete with non-existent records', async () => {
      await expect(
        db.storage.bulkDelete(['non-existent-1', 'non-existent-2']),
      ).resolves.toMatchObject([]);
    });
  });

  describe('Clear Storage Records', () => {
    it('should delete all records from the storage table', async () => {
      const input = {
        key: 'test-key-1',
        originalName: 'somefile',
        size: 100,
        mimeType: 'application/json',
        hash: 'zzz',
      };
      const input2 = {
        key: 'test-key-2',
        originalName: 'somefile',
        size: 100,
        mimeType: 'application/json',
        hash: 'aaa',
      };
      await db.storage.create(input);
      await db.storage.create(input2);

      const records = await db.storage.getList();
      expect(records).toHaveLength(2);

      await db.storage.bulkDelete(
        records.map((r) => r.id),
        true,
      );

      const postDeleteRecords = await db.storage.getList();
      expect(postDeleteRecords).toHaveLength(0);
    });
  });
});
