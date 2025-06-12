import { createExecutionContext, env } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import { initDBInstance } from '@/index';

const ctx = createExecutionContext();
const db = initDBInstance(ctx, env);

describe('BaseService relations', () => {
  let testStorageIds: string[] = [];
  let testInfoIds: string[] = [];

  beforeEach(async () => {
    // Clean up previous test data
    if (testInfoIds.length > 0) {
      await db.storage_info.bulkDelete(testInfoIds, true);
    }
    if (testStorageIds.length > 0) {
      await db.storage.bulkDelete(testStorageIds, true);
    }

    testStorageIds = [];
    testInfoIds = [];

    // Create multiple test records for comprehensive testing
    const storageRecords = await Promise.all([
      db.storage.create({
        key: 'test-file-1',
        originalName: 'document1.pdf',
        size: 1024,
        mimeType: 'application/pdf',
        hash: 'hash1',
      }),
      db.storage.create({
        key: 'test-file-2',
        originalName: 'image2.jpg',
        size: 2048,
        mimeType: 'image/jpeg',
        hash: 'hash2',
      }),
      db.storage.create({
        key: 'test-file-3',
        originalName: 'video3.mp4',
        size: 4096,
        mimeType: 'video/mp4',
        hash: 'hash3',
      }),
      db.storage.create({
        key: 'test-file-4',
        originalName: 'audio4.mp3',
        size: 512,
        mimeType: 'audio/mpeg',
        hash: 'hash4',
      }),
    ]);

    testStorageIds = storageRecords.map((s) => s.id);

    const infoRecords = await Promise.all([
      db.storage_info.create({
        storageId: storageRecords[0].id,
        description: 'Important document for project A',
      }),
      db.storage_info.create({
        storageId: storageRecords[1].id,
        description: 'Profile picture for user',
      }),
      db.storage_info.create({
        storageId: storageRecords[2].id,
        description: 'Training video content',
      }),
      db.storage_info.create({
        storageId: storageRecords[3].id,
        description: 'Background music track',
      }),
    ]);

    testInfoIds = infoRecords.map((i) => i.id);
  });

  it('should retrieve joined data by id', async () => {
    const record = await db.storage_info.getByIdWithRelations(testInfoIds[0]);

    expect(record).toBeDefined();
    expect(record.storage_info.id).toBe(testInfoIds[0]);
    expect(record.storage_info.description).toBe(
      'Important document for project A',
    );
    expect(record.storage).toBeDefined();
    expect(record.storage.id).toBe(testStorageIds[0]);
    expect(record.storage.originalName).toBe('document1.pdf');
    expect(record.storage.mimeType).toBe('application/pdf');
  });

  it('should retrieve list with relations', async () => {
    const list = await db.storage_info.getListWithRelations();

    expect(list.length).toBeGreaterThanOrEqual(4);

    // Check that each record has both storage_info and storage data
    list.forEach((record) => {
      expect(record.storage_info).toBeDefined();
      expect(record.storage_info.id).toBeDefined();
      expect(record.storage_info.description).toBeDefined();
      expect(record.storage).toBeDefined();
      expect(record.storage.id).toBeDefined();
      expect(record.storage.originalName).toBeDefined();
    });
  });

  it('should handle pagination with relations', async () => {
    // Test first page
    const firstPage = await db.storage_info.getListWithRelations([0, 1]);
    expect(firstPage.length).toBe(2);

    // Test second page
    const secondPage = await db.storage_info.getListWithRelations([2, 3]);
    expect(secondPage.length).toBe(2);

    // Ensure different records
    const firstPageIds = firstPage.map((r) => r.storage_info.id);
    const secondPageIds = secondPage.map((r) => r.storage_info.id);
    expect(firstPageIds).not.toEqual(secondPageIds);
  });

  it('should handle sorting with relations', async () => {
    // Test ascending sort by description
    const ascList = await db.storage_info.getListWithRelations(undefined, [
      'description',
      'ASC',
    ]);

    expect(ascList.length).toBeGreaterThanOrEqual(4);

    // Check if sorted correctly (descriptions should be in alphabetical order)
    for (let i = 1; i < ascList.length; i++) {
      expect(
        ascList[i].storage_info.description >=
          ascList[i - 1].storage_info.description,
      ).toBe(true);
    }

    // Test descending sort by description
    const descList = await db.storage_info.getListWithRelations(undefined, [
      'description',
      'DESC',
    ]);

    expect(descList.length).toBeGreaterThanOrEqual(4);

    // Check if sorted correctly (descriptions should be in reverse alphabetical order)
    for (let i = 1; i < descList.length; i++) {
      expect(
        descList[i].storage_info.description <=
          descList[i - 1].storage_info.description,
      ).toBe(true);
    }
  });

  it('should handle filtering with relations', async () => {
    // Filter by specific storage ID
    const filtered = await db.storage_info.getListWithRelations(
      undefined,
      undefined,
      { storageId: testStorageIds[0] },
    );

    expect(filtered.length).toBe(1);
    expect(filtered[0].storage_info.storageId).toBe(testStorageIds[0]);
    expect(filtered[0].storage.id).toBe(testStorageIds[0]);
    expect(filtered[0].storage_info.description).toBe(
      'Important document for project A',
    );
  });

  it('should handle combined pagination, sorting, and filtering', async () => {
    // Create additional records for more comprehensive testing
    const extraStorage = await db.storage.create({
      key: 'extra-file',
      originalName: 'extra.txt',
      size: 256,
      mimeType: 'text/plain',
      hash: 'extra-hash',
    });
    testStorageIds.push(extraStorage.id);

    const extraInfo = await db.storage_info.create({
      storageId: extraStorage.id,
      description: 'Additional test file',
    });
    testInfoIds.push(extraInfo.id);

    // Test with pagination, sorting, and filtering combined
    const result = await db.storage_info.getListWithRelations(
      [0, 2], // First 3 records
      ['description', 'ASC'], // Sort by description ascending
      undefined, // No filter
      false, // Don't include deleted
    );

    expect(result.length).toBe(3);

    // Verify sorting
    for (let i = 1; i < result.length; i++) {
      expect(
        result[i].storage_info.description >=
          result[i - 1].storage_info.description,
      ).toBe(true);
    }

    // Verify relations are intact
    result.forEach((record) => {
      expect(record.storage_info).toBeDefined();
      expect(record.storage).toBeDefined();
      expect(record.storage_info.storageId).toBe(record.storage.id);
    });
  });

  it('should handle soft delete functionality with relations', async () => {
    // Note: storage_info schema doesn't have deletedAt field, so we'll test soft delete on storage
    // and verify that relations still work when the related storage is soft deleted

    // Soft delete one of the storage records (not storage_info)
    await db.storage.delete(testStorageIds[0], false);

    // The storage_info record should still exist, but its related storage should be soft deleted
    const infoList = await db.storage_info.getListWithRelations();
    const infoRecord = infoList.find(
      (r) => r.storage_info.storageId === testStorageIds[0],
    );

    // The storage_info record should still be there
    expect(infoRecord).toBeDefined();
    expect(infoRecord.storage_info.storageId).toBe(testStorageIds[0]);

    // But when we try to get storage records without including deleted, the soft-deleted one shouldn't appear
    const storageList = await db.storage.getList();
    const storageIds = storageList.map((s) => s.id);
    expect(storageIds).not.toContain(testStorageIds[0]);

    // When including deleted, it should appear
    const storageWithDeleted = await db.storage.getList(
      undefined,
      undefined,
      undefined,
      true,
    );
    const storageWithDeletedIds = storageWithDeleted.map((s) => s.id);
    expect(storageWithDeletedIds).toContain(testStorageIds[0]);

    // Verify the soft-deleted storage record has deletedAt set
    const deletedStorage = storageWithDeleted.find(
      (s) => s.id === testStorageIds[0],
    );
    expect(deletedStorage).toBeDefined();
    if (deletedStorage) {
      expect(deletedStorage.deletedAt).toBeTruthy();
    }
  });

  it('should handle empty results gracefully', async () => {
    // Filter by non-existent storage ID
    const emptyResult = await db.storage_info.getListWithRelations(
      undefined,
      undefined,
      { storageId: 'non-existent-id' },
    );

    expect(emptyResult).toEqual([]);
  });

  it('should maintain data integrity across relations', async () => {
    const list = await db.storage_info.getListWithRelations();

    // Verify that each storage_info record's storageId matches its related storage record's id
    list.forEach((record) => {
      expect(record.storage_info.storageId).toBe(record.storage.id);
    });

    // Verify that all expected test records are present
    const infoIds = list.map((r) => r.storage_info.id);
    testInfoIds.forEach((id) => {
      expect(infoIds).toContain(id);
    });
  });
});
