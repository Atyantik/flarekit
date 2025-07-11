import { createApiEndpoint } from '@/utils/api-builder.util';
import {
  UploadsCreateRequestSchema,
  UploadsCreateSuccessResponseSchema,
} from '@/schemas/uploads.schema';
import { ValidationError } from '@/classes/ValidationError.class';
import { ExternalServiceError } from '@/classes/ExternalServiceError.class';
import { computeRandomHash } from '@/utils/hash.util';

export const uploadsCreateEndpoint = createApiEndpoint({
  resource: 'Uploads',
  method: 'post',
  path: '/api/v1/uploads',
  request: {
    body: {
      content: { 'application/json': { schema: UploadsCreateRequestSchema } },
    },
  },
  responseSchema: UploadsCreateSuccessResponseSchema,
  handler: async (c) => {
    const body = await c.req.json();
    const { key: requestKey } = body;
    const key = requestKey ? requestKey : await computeRandomHash();
    if (!key)
      throw new ValidationError('Missing key in request body', [
        { field: 'key', message: 'Key is required' },
      ]);
    try {
      const multipartUpload = await c.env.STORAGE.createMultipartUpload(key);
      return {
        success: true,
        key: multipartUpload.key,
        uploadId: multipartUpload.uploadId,
      };
    } catch (error: any) {
      throw ExternalServiceError.serviceUnavailable('R2', {
        originalError: error.message,
        service: 'R2',
        operation: 'createMultipartUpload',
      });
    }
  },
});
