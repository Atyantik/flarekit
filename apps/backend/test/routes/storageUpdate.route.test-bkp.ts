import { env, createExecutionContext } from 'cloudflare:test';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '@/index';
import { initDBInstance } from '@flarekit/database';

describe('Storage Update Route', () => {
  let testStorageId: string;

  beforeAll(async () => {
    const ctx = createExecutionContext();
    const db = initDBInstance(ctx, env);

    // Create a test storage record
    const testRecord = await db.storage.create({
      key: 'test-update-key.jpg',
      originalName: 'test-image.jpg',
      size: 1024,
      mimeType: 'image/jpeg',
      hash: 'test-hash-123',
    });
    testStorageId = testRecord.id;
  });

  afterAll(async () => {
    // Clean up test data
    const ctx = createExecutionContext();
    const db = initDBInstance(ctx, env);

    try {
      await db.storage.delete(testStorageId, true);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('Should replace storage record with new file', async () => {
    // Create a mock file for testing
    const mockFile = new File(['new image content'], 'new-image.png', {
      type: 'image/png',
    });

    const formData = new FormData();
    formData.append('images[]', mockFile);

    const res = await app.request(
      `/api/v1/storage/${testStorageId}`,
      {
        method: 'PUT',
        body: formData,
      },
      env,
    );

    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.message).toBe('Storage record and file updated successfully');
    expect(data.data.id).toBe(testStorageId);
    expect(data.data.originalName).toBe('new-image.png');
    expect(data.data.mimeType).toBe('image/png');
    expect(data.fileReplaced).toBe(true);
    // The key should be different since it's based on hash + filename
    expect(data.data.key).not.toBe('test-update-key.jpg');
  });

  it('Should return 400 when no file is provided', async () => {
    const formData = new FormData();
    // No file appended

    const res = await app.request(
      `/api/v1/storage/${testStorageId}`,
      {
        method: 'PUT',
        body: formData,
      },
      env,
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.message).toContain('No file provided for replacement');
  });

  it('Should return 404 for non-existent storage record', async () => {
    const nonExistentId = 'non-existent-id';
    const mockFile = new File(['test content'], 'test.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('images[]', mockFile);

    const res = await app.request(
      `/api/v1/storage/${nonExistentId}`,
      {
        method: 'PUT',
        body: formData,
      },
      env,
    );

    expect(res.status).toBe(404);
    const data = (await res.json()) as any;
    expect(data.code).toBe('RESOURCE_NOT_FOUND');
    expect(data.message).toContain('Storage');
  });

  it('Should return 400 for invalid file type', async () => {
    const invalidFile = new File(['test content'], 'test.txt', {
      type: 'text/plain',
    });

    const formData = new FormData();
    formData.append('images[]', invalidFile);

    const res = await app.request(
      `/api/v1/storage/${testStorageId}`,
      {
        method: 'PUT',
        body: formData,
      },
      env,
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.message).toContain('Invalid file');
  });

  it('Should return 400 for file exceeding size limit', async () => {
    // Create a large file (3MB)
    const largeContent = 'x'.repeat(3 * 1024 * 1024);
    const largeFile = new File([largeContent], 'large-image.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('images[]', largeFile);

    const res = await app.request(
      `/api/v1/storage/${testStorageId}`,
      {
        method: 'PUT',
        body: formData,
      },
      env,
    );

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.message).toContain('Invalid file');
  });
});
