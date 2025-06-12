// src/routes/upload.route.test.ts
import { env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { app } from '@/index'; // Assuming the app is exported from src/index
import { ValidationError } from '@/classes/ValidationError.class';

describe('Upload Route', () => {
  it('Should return 400 if no images[] are found', async () => {
    const response = await app.request('/api/v1/storage', {
      method: 'POST',
      body: new FormData(),
    });
    expect(response.status).toBe(400);
    const error: any = await response.json();
    const expectedError = new ValidationError('No images provided.', [
      { field: 'images[]', code: 'REQUIRED', message: 'Images are required' },
    ]).toJSON();
    expect(error.code).toBe(expectedError.code);
    expect(error.status).toBe(expectedError.status);
    expect(error.message).toBe(expectedError.message);
    expect(error.details).toEqual(expectedError.details);
  });

  it('Should return 200 and upload images if valid images are provided', async () => {
    const atyantikImage = env.ASSETS?.['atyantik.png'];
    if (!atyantikImage) {
      throw new Error('Cannot find asset');
    }
    const file = new File([atyantikImage], 'atyantik.png', {
      type: 'image/png',
    });

    const formData = new FormData();
    formData.append('images[]', file, 'atyantik.png');

    const response = await app.request(
      '/api/v1/storage',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const responseData: any = (await response.json()) as any;

    expect(response.status).toBe(201);
    expect(responseData.message).toBe('Images uploaded successfully');
    expect(responseData.data).toHaveLength(1);
    expect(responseData.data?.[0]?.originalName).toBe(file.name);
  });

  it('Should ignore invalid files and return 200 with valid images', async () => {
    const atyantikImage = env.ASSETS?.['atyantik.png'];
    const largeImage = env.ASSETS?.['2mb.jpg'];
    if (!atyantikImage || !largeImage) {
      throw new Error('Cannot find assets');
    }
    const atyantikFile = new File([atyantikImage], 'atyantik.png', {
      type: 'image/png',
    });
    const largeFile = new File([largeImage], '2mb.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('images[]', atyantikFile, atyantikFile.name);
    formData.append('images[]', largeFile, largeFile.name);

    const response = await app.request(
      '/api/v1/storage',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const responseData: any = (await response.json()) as any;

    expect(response.status).toBe(201);
    expect(responseData.message).toBe('Images uploaded successfully');
    expect(responseData.data).toHaveLength(1);
    expect(responseData.data?.[0]?.originalName).toBe(atyantikFile.name);
  });

  it('Should return 400 if all files exceeds the maximum file size', async () => {
    const largeImage = env.ASSETS?.['2mb.jpg'];
    if (!largeImage) {
      throw new Error('Cannot find assets');
    }
    const largeFile = new File([largeImage], '2mb.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('images[]', largeFile, largeFile.name);

    const response = await app.request(
      '/api/v1/storage',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const error: any = await response.json();
    expect(response.status).toBe(400);
    const expectedError = new ValidationError('Invalid image files', [
      {
        field: 'images[]',
        code: 'INVALID_FILES',
        message: expect.stringContaining('Please ensure files are'),
        value: expect.anything(),
      },
    ]).toJSON();
    expect(error.code).toBe(expectedError.code);
    expect(error.status).toBe(expectedError.status);
    expect(error.message).toBe(expectedError.message);
    expect(error.details[0]).toEqual(
      expect.objectContaining({
        field: 'images[]',
        code: 'INVALID_FILES',
        message: expect.stringContaining('Please ensure files are'),
        value: expect.anything(),
      }),
    );
  });

  it('Should return append true and false based on image uploaded or existed', async () => {
    const atyantikImage = env.ASSETS?.['atyantik.png'];
    if (!atyantikImage) {
      throw new Error('Cannot find assets');
    }
    const atyantikFile = new File([atyantikImage], 'atyantik.png', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('images[]', atyantikFile, atyantikFile.name);

    const response = await app.request(
      '/api/v1/storage',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const responseData: any = (await response.json()) as any;
    expect(response.status).toBe(201);
    expect(responseData.message).toBe('Images uploaded successfully');
    expect(responseData.data).toHaveLength(1);
    expect(responseData.data?.[0]?.append).toBe(true);

    const reuploadResponse = await app.request(
      '/api/v1/storage',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const reuploadResponseData: any = (await reuploadResponse.json()) as any;
    expect(reuploadResponse.status).toBe(201);
    expect(reuploadResponseData.message).toBe('Images uploaded successfully');
    expect(reuploadResponseData.data).toHaveLength(1);
    expect(reuploadResponseData.data?.[0]?.append).toBe(false);
  });
});
