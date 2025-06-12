import { createExecutionContext, env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { initDBInstance } from '@/index';

const ctx = createExecutionContext();
const db = initDBInstance(ctx, env);

describe('BaseService relations', () => {
  it('should retrieve joined data by id', async () => {
    const storage = await db.storage.create({
      key: 'rel-key',
      originalName: 'file.txt',
      size: 1,
      mimeType: 'text/plain',
      hash: 'hash',
    });

    const info = await db.storage_info.create({
      storageId: storage.id,
      description: 'info',
    });

    const record = await db.storage_info.getByIdWithRelations(info.id);
    expect(record.storage_info.id).toBe(info.id);
    expect(record.storage.id).toBe(storage.id);
  });

  it('should retrieve list with relations', async () => {
    const storage = await db.storage.create({
      key: 'rel-key-2',
      originalName: 'file2.txt',
      size: 2,
      mimeType: 'text/plain',
      hash: 'hash2',
    });

    await db.storage_info.create({
      storageId: storage.id,
      description: 'info2',
    });

    const list = await db.storage_info.getListWithRelations();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].storage).toBeDefined();
  });
});
