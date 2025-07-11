import { createApiEndpoint } from '@/utils/api-builder.util';
import {
  UploadsCompleteParamSchema,
  UploadsCompleteQuerySchema,
  UploadsCompleteRequestSchema,
  UploadsCompleteSuccessResponseSchema,
} from '@/schemas/uploads.schema';
import { ValidationError } from '@/classes/ValidationError.class';
import { ExternalServiceError } from '@/classes/ExternalServiceError.class';

export const uploadsCompleteEndpoint = createApiEndpoint({
  resource: 'Uploads',
  method: 'post',
  path: '/api/v1/uploads/{key}/complete',
  request: {
    params: UploadsCompleteParamSchema,
    query: UploadsCompleteQuerySchema,
    body: {
      content: { 'application/json': { schema: UploadsCompleteRequestSchema } },
    },
  },
  responseSchema: UploadsCompleteSuccessResponseSchema,
  handler: async (c) => {
    const params = c.req.param();
    const query = c.req.valid('query');
    const { key } = params;
    const { uploadId } = query;

    if (!uploadId) {
      throw new ValidationError('Missing uploadId in query', [
        { field: 'uploadId', message: 'uploadId is required' },
      ]);
    }

    const body = await c.req.json();
    const { parts } = body;

    if (!parts || !Array.isArray(parts) || parts.length === 0) {
      throw new ValidationError('Invalid parts array', [
        {
          field: 'parts',
          message: 'Parts array is required and must not be empty',
        },
      ]);
    }

    try {
      const multipartUpload = c.env.STORAGE.resumeMultipartUpload(
        key,
        uploadId,
      );
      const object = await multipartUpload.complete(parts);
      console.log(object);

      return {
        success: true,
        message: 'Upload complete',
        etag: object.httpEtag,
      };
    } catch (error: any) {
      throw ExternalServiceError.serviceUnavailable('R2', {
        originalError: error.message,
        service: 'R2',
        operation: 'completeMultipartUpload',
        key,
        uploadId,
      });
    }
  },
});
