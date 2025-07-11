import { z } from '@hono/zod-openapi';
import { createApiEndpoint } from '@/utils/api-builder.util';
import {
  UploadsUploadPartParamSchema,
  UploadsUploadPartQuerySchema,
  UploadsUploadPartSuccessResponseSchema,
} from '@/schemas/uploads.schema';
import { ValidationError } from '@/classes/ValidationError.class';
import { ExternalServiceError } from '@/classes/ExternalServiceError.class';

export const uploadsUploadPartEndpoint = createApiEndpoint({
  resource: 'Uploads',
  method: 'put',
  path: '/api/v1/uploads/{key}/parts/{part}',
  request: {
    params: UploadsUploadPartParamSchema,
    query: UploadsUploadPartQuerySchema,
    body: {
      content: {
        'application/octet-stream': {
          schema: z.any().openapi({
            type: 'string',
            format: 'binary',
            description:
              'Raw file content as binary. Use the "Try it out" button to upload a file directly.',
            example: undefined, // OpenAPI UI will show file upload for binary string
          }),
        },
      },
    },
    // Body is binary, not validated by Zod
  },
  responseSchema: UploadsUploadPartSuccessResponseSchema,
  handler: async (c) => {
    const params = c.req.param();
    const query = c.req.valid('query');
    const { key, part } = params;
    const { uploadId } = query;
    if (!uploadId)
      throw new ValidationError('Missing uploadId in query', [
        { field: 'uploadId', message: 'uploadId is required' },
      ]);
    const partNumber = parseInt(part, 10);
    if (isNaN(partNumber) || partNumber < 1) {
      throw new ValidationError('Invalid part number', [
        { field: 'part', message: 'Part number must be a positive integer' },
      ]);
    }
    const body = await c.req.arrayBuffer();
    console.log(body);
    if (!body)
      throw new ValidationError('Missing request body', [
        { field: 'body', message: 'Body is required' },
      ]);
    console.log(body.byteLength);
    try {
      const multipartUpload = c.env.STORAGE.resumeMultipartUpload(
        key,
        uploadId,
      );
      const uploadedPart = await multipartUpload.uploadPart(partNumber, body);
      return {
        success: true,
        etag: uploadedPart.etag,
        partNumber,
      };
    } catch (error: any) {
      throw ExternalServiceError.serviceUnavailable('R2', {
        originalError: error.message,
        service: 'R2',
        operation: 'uploadPart',
      });
    }
  },
});
