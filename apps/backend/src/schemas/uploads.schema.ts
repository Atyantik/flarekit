import { z } from '@hono/zod-openapi';

export const UploadsCreateRequestSchema = z
  .object({
    key: z
      .string()
      .optional()
      .openapi({
        example: 'File key - provide unique key for non-duplicate file uploads',
      }),
  })
  .openapi('Uploads.CreateRequest');

export const UploadsCreateSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    key: z.string().openapi({ example: 'File key - hash or name' }),
    uploadId: z.string().openapi({ example: '2~QWERTY1234567890' }),
  })
  .openapi('Uploads.CreateSuccessResponse');

export const UploadsUploadPartParamSchema = z
  .object({
    key: z
      .string()
      .openapi({
        example: 'File key - hash or name returned from POST /uploads',
      }),
    part: z
      .string()
      .openapi({
        example: '1',
        description: 'Part number (as string in path)',
      }),
  })
  .openapi('Uploads.UploadPartParams');

export const UploadsUploadPartQuerySchema = z
  .object({
    uploadId: z
      .string()
      .openapi({
        example: '2~QWERTY1234567890',
        description: 'The multipart upload session ID.',
      }),
  })
  .openapi('Uploads.UploadPartQuery');

export const UploadsUploadPartSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    etag: z.string().openapi({ example: 'etag-part-1' }),
    partNumber: z.number().openapi({ example: 1 }),
  })
  .openapi('Uploads.UploadPartSuccessResponse');

export const UploadsCompleteParamSchema = z
  .object({
    key: z.string().openapi({ example: 'my-large-file.zip' }),
  })
  .openapi('Uploads.CompleteParams');

export const UploadsCompleteQuerySchema = z
  .object({
    uploadId: z.string().openapi({ example: '2~QWERTY1234567890' }),
  })
  .openapi('Uploads.CompleteQuery');

export const UploadsCompleteRequestSchema = z
  .object({
    parts: z
      .array(
        z.object({
          etag: z.string().openapi({ example: 'etag-part-1' }),
          partNumber: z.number().openapi({ example: 1 }),
        }),
      )
      .openapi({ description: 'Array of uploaded part info.' }),
  })
  .openapi('Uploads.CompleteRequest');

export const UploadsCompleteSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    message: z.string().openapi({ example: 'Upload complete' }),
    etag: z.string().openapi({ example: 'final-etag' }),
  })
  .openapi('Uploads.CompleteSuccessResponse');

export const UploadsDeleteParamSchema = z
  .object({
    key: z.string().openapi({ example: 'my-large-file.zip' }),
  })
  .openapi('Uploads.DeleteParams');

export const UploadsDeleteQuerySchema = z
  .object({
    uploadId: z
      .string()
      .optional()
      .openapi({
        example: '2~QWERTY1234567890',
        description: 'The multipart upload session ID (optional for abort).',
      }),
  })
  .openapi('Uploads.DeleteQuery');

export const UploadsDeleteSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    message: z.string().openapi({ example: 'Upload aborted or file deleted' }),
  })
  .openapi('Uploads.DeleteSuccessResponse');

export const UploadsGetOneParamSchema = z
  .object({
    key: z.string().openapi({ example: 'my-large-file.zip' }),
  })
  .openapi('Uploads.GetOneParams');
