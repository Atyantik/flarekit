import { createExecutionContext, env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { initDBInstance } from '@/index';

describe('Initialized Database', () => {
  it('Should be initilized without errors', async () => {
    const ctx = createExecutionContext();
    const db = initDBInstance(ctx, env);
    expect(db).toBeDefined();

    const db2 = initDBInstance(ctx, env);
    expect(db2).toBeDefined();
  });

  // Hypothetical usage
  it('Should create an item in storage', async () => {
    const ctx = createExecutionContext();
    const db = initDBInstance(ctx, env);

    const record = await db.storage.create({
      key: 'myKey',
      originalName: 'example.jpg',
      size: 12345,
      mimeType: 'image/jpeg',
      hash: 'abc123hash',
    });

    // Validate the returned record
    expect(record).toBeDefined();
    expect(record).toHaveProperty('id');
    expect(record.key).toBe('myKey');
    expect(record.originalName).toBe('example.jpg');
    expect(record.size).toBe(12345);
    expect(record.mimeType).toBe('image/jpeg');
    expect(record.hash).toBe('abc123hash');
  });
});
