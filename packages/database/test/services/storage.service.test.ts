import { createExecutionContext, env } from 'cloudflare:test';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { getInstance, initDBInstance } from '../../src';
import { validate } from 'uuid';

const ctx = createExecutionContext();
const db = initDBInstance(ctx, env);

describe('storage.service', () => {
  afterEach(() => {
    // Reset mocks between tests
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  describe('createStorageRecord', () => {
    it('should create a new storage record with a generated UUID and return it (success)', async () => {
      const input = {
        key: 'test-key',
        originalName: 'test.txt',
        size: 123,
        mimeType: 'text/plain',
        hash: 'somehash',
      };

      const result = await db.storage.createStorageRecord(input);
      expect(env.CACHE.get('storage_records')).resolves.toBeNull();
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

      await expect(db.storage.createStorageRecord(input)).rejects.toThrow(
        'DB Insert Failed',
      );
    });

    it('should throw an error if response.success is false', async () => {
      const instance = getInstance(ctx);
      if (!instance) {
        throw new Error(
          'Ctx instance not found. Make sure initDatabase is implemented',
        );
      }
      // 1. Mock the db.insert(...) chain to return { success: false, reason: "some-error" }
      vi.spyOn(instance.db, 'insert').mockImplementation(() => {
        return {
          values: vi.fn().mockResolvedValue({
            success: false,
            reason: 'some-error',
          }),
        } as any;
      });

      // 2. Prepare your input
      const input = {
        key: 'somekey',
        originalName: 'somefile',
        size: 100,
        mimeType: 'application/json',
        hash: 'zzz',
      };

      // 3. Assert that createStorageRecord rejects with the expected error object
      await expect(db.storage.createStorageRecord(input)).rejects.toEqual({
        success: false,
        reason: 'some-error',
      });
    });
  });

  describe('getStorageRecordFromKey', () => {
    it('should return the first matched record if found', async () => {
      const input = {
        key: 'test-key',
        originalName: 'somefile',
        size: 100,
        mimeType: 'application/json',
        hash: 'zzz',
      };
      await db.storage.createStorageRecord(input);

      const result = await db.storage.getStorageRecordFromKey('test-key');

      expect(result).toBeDefined();
    });

    it('should return null if no record is found', async () => {
      const result =
        await db.storage.getStorageRecordFromKey('non-existent-key');
      expect(result).toBeNull();
    });

    it('should throw an error if the query fails', async () => {
      const instance = getInstance(ctx);
      if (!instance) {
        throw new Error(
          'Ctx instance not found. Make sure initDatabase is implemented',
        );
      }
      // 1. Mock the db.insert(...) chain to return { success: false, reason: "some-error" }
      vi.spyOn(instance.db, 'select').mockImplementation(() => {
        throw new Error('DB Select Failed');
      });
      await expect(db.storage.getStorageRecordFromKey('foo')).rejects.toThrow(
        'DB Select Failed',
      );
    });
  });

  describe('listStorageRecords', () => {
    it('should list all active (non-deleted) records in descending order of createdAt', async () => {
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
      await db.storage.clearStorageRecords();
      expect(env.CACHE.get('storage_records')).resolves.toBeNull();
      const record1 = await db.storage.createStorageRecord(input);
      const record2 = await db.storage.createStorageRecord(input2);

      const result = await db.storage.listStorageRecords();

      expect(result).toHaveLength(2);
      expect(env.CACHE.get('storage_records')).resolves.toBe(
        JSON.stringify(result),
      );

      const cachedResult = await db.storage.listStorageRecords();
      expect(env.CACHE.get('storage_records')).resolves.toBe(
        JSON.stringify(result),
      );
      expect(result).toMatchObject(cachedResult);
      expect(result[0].id).eq(record1.id);
      expect(result[1].id).eq(record2.id);
    });

    it('should list all records even it cache is not present', async () => {
      const instance = getInstance(ctx);
      if (!instance) {
        throw new Error(
          'Ctx instance not found. Make sure initDatabase is implemented',
        );
      }
      const cache = instance.cache;
      delete instance.cache;
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
      await db.storage.clearStorageRecords();
      expect(env.CACHE.get('storage_records')).resolves.toBeNull();
      await db.storage.createStorageRecord(input);
      await db.storage.createStorageRecord(input2);

      const result = await db.storage.listStorageRecords();

      expect(result).toHaveLength(2);
      instance.cache = cache;
    });

    it('should throw if the listing fails', async () => {
      const instance = getInstance(ctx);
      if (!instance) {
        throw new Error(
          'Ctx instance not found. Make sure initDatabase is implemented',
        );
      }
      vi.spyOn(instance.db, 'select').mockImplementation(() => {
        throw new Error('DB Select Error');
      });
      await expect(db.storage.listStorageRecords()).rejects.toThrow(
        'DB Select Error',
      );
    });
  });

  describe('clearStorageRecords', () => {
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
      await db.storage.clearStorageRecords();
      await db.storage.createStorageRecord(input);
      await db.storage.createStorageRecord(input2);

      const records = await db.storage.listStorageRecords();
      expect(records).toHaveLength(2);

      await db.storage.clearStorageRecords();

      const postDeleteRecords = await db.storage.listStorageRecords();
      expect(postDeleteRecords).toHaveLength(0);
    });

    it('should throw if the deletion fails', async () => {
      const instance = getInstance(ctx);
      if (!instance) {
        throw new Error(
          'Ctx instance not found. Make sure initDatabase is implemented',
        );
      }
      // 1. Mock the db.insert(...) chain to return { success: false, reason: "some-error" }
      vi.spyOn(instance.db, 'delete').mockImplementation(() => {
        throw new Error('DB Delete Error');
      });
      await expect(db.storage.clearStorageRecords()).rejects.toThrow(
        'DB Delete Error',
      );
      expect(instance.db.delete).toHaveBeenCalledTimes(1);
    });
  });
});
