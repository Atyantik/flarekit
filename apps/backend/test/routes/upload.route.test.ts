// src/routes/upload.route.test.ts
import { env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { app } from '@/index'; // Assuming the app is exported from src/index
import { ApiError } from '@/classes/ApiError.class';

describe('Upload Route', () => {
  it('Should return 400 if no images[] are found', async () => {
    const response = await app.request('/api/v1/upload', {
      method: 'POST',
      body: new FormData(),
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      new ApiError(400, 'No images[] found.').toJSON(),
    );
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
      '/api/v1/upload',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const responseData = (await response.json()) as any;

    expect(response.status).toBe(200);
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
      '/api/v1/upload',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const responseData = (await response.json()) as any;

    expect(response.status).toBe(200);
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
      '/api/v1/upload',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const responseData = await response.json();
    expect(response.status).toBe(400);
    expect(responseData).toEqual(
      new ApiError(
        400,
        'No valid images found. Please ensure files are images under 2MB.',
      ).toJSON(),
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
      '/api/v1/upload',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const responseData = (await response.json()) as any;
    expect(response.status).toBe(200);
    expect(responseData.message).toBe('Images uploaded successfully');
    expect(responseData.data).toHaveLength(1);
    expect(responseData.data?.[0]?.append).toBe(true);

    const reuploadResponse = await app.request(
      '/api/v1/upload',
      {
        method: 'POST',
        body: formData,
      },
      env,
    );

    const reuploadResponseData = (await reuploadResponse.json()) as any;
    expect(reuploadResponse.status).toBe(200);
    expect(reuploadResponseData.message).toBe('Images uploaded successfully');
    expect(reuploadResponseData.data).toHaveLength(1);
    expect(reuploadResponseData.data?.[0]?.append).toBe(false);
  });

  // it('Should throw error if STORAGE binding is not found', async () => {
  //   const atyantikImage = env.ASSETS?.['atyantik.png'];
  //   if (!atyantikImage) {
  //     throw new Error('Cannot find assets');
  //   }
  //   const atyantikFile = new File([atyantikImage], 'atyantik.png', {
  //     type: 'image/jpeg',
  //   });

  //   const formData = new FormData();
  //   formData.append('images[]', atyantikFile, atyantikFile.name);

  //   const response = await app.request(
  //     '/api/v1/upload',
  //     {
  //       method: 'POST',
  //       body: formData,
  //     },
  //     {
  //       CACHE: env.CACHE,
  //       DB: env.DB,
  //     },
  //   );

  //   const responseData = (await response.json()) as any;
  //   expect(response.status).toBe(400);
  //   expect(responseData).toEqual({
  //     success: false,
  //     message: 'You need to add storage binding to the environment.',
  //   });
  // });
});
