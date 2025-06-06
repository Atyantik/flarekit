import { uploadFiles } from '@utils/upload.util';
import {
  StorageCreateSuccessResponseSchema,
  StorageCreateRequestSchema,
  UploadConstraintsSchema,
} from '@/schemas/storage.schema';
import { ValidationError } from '@/classes/ValidationError.class';
import { ExternalServiceError } from '@/classes/ExternalServiceError.class';
import { createApiEndpoint } from '@/utils/api-builder.util';

// Get upload constraints from schema
const uploadConstraints = UploadConstraintsSchema.parse({});
const MAX_FILE_SIZE = uploadConstraints.maxFileSize;
const ALLOWED_MIME_TYPES = uploadConstraints.allowedMimeTypes;

export const storageCreateEndpoint = createApiEndpoint({
  resource: 'Storage',
  method: 'post',
  path: '/api/v1/storage',
  responseSchema: StorageCreateSuccessResponseSchema,
  handler: async (c) => {
    const body = await c.req.parseBody();
    let images = body?.['images[]'];

    if (!body?.['images[]']) {
      throw new ValidationError('No images provided', [
        { field: 'images[]', code: 'REQUIRED', message: 'Images are required' },
      ]);
    }

    /**
     * If the images is a single file, we convert it to an array
     * and make sure that they are instance of file
     */
    let allUploadedImages = [] as File[];
    if (
      !Array.isArray(images) &&
      images instanceof File &&
      ALLOWED_MIME_TYPES.includes(images.type) &&
      images.size <= MAX_FILE_SIZE
    ) {
      allUploadedImages = [images];
    }
    if (Array.isArray(images)) {
      for (const image of images) {
        if (
          image instanceof File &&
          ALLOWED_MIME_TYPES.includes(image.type) &&
          image.size <= MAX_FILE_SIZE
        ) {
          allUploadedImages.push(image);
        }
      }
    }
    if (!allUploadedImages.length) {
      const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
      const allowedTypes = ALLOWED_MIME_TYPES.map((type) =>
        type.split('/')[1].toUpperCase(),
      ).join(', ');
      throw new ValidationError('Invalid image files', [
        {
          field: 'images[]',
          code: 'INVALID_FILES',
          message: `Please ensure files are ${allowedTypes} images under ${maxSizeMB}MB`,
          value: images,
        },
      ]);
    }

    try {
      const uploadData = await uploadFiles(allUploadedImages, c.env);
      return c.json({
        success: true,
        message: 'Images uploaded successfully',
        data: uploadData,
      });
    } catch (ex) {
      if (ex instanceof Error) {
        throw ExternalServiceError.serviceUnavailable('File storage service', {
          originalError: ex.message,
          files: allUploadedImages.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        });
      }
      throw ExternalServiceError.serviceUnavailable('File storage service', {
        files: allUploadedImages.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      });
    }
  },
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: StorageCreateRequestSchema,
        },
      },
    },
  },
});
