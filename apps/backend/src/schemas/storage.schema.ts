import { z } from '@hono/zod-openapi';

// Schema for individual storage record
export const StorageRecordSchema = z
  .object({
    id: z.string().openapi({ example: '01957fc3-1239-7fb3-9df5-8914cd9c9172' }),
    key: z.string().openapi({ example: 'abc123-image.jpg' }),
    originalName: z.string().openapi({ example: 'image.jpg' }),
    size: z.number().openapi({ example: 1048576 }),
    mimeType: z.string().openapi({ example: 'image/jpeg' }),
    hash: z.string().openapi({ example: 'abc123def456' }),
    createdAt: z
      .string()
      .nullable()
      .openapi({ example: '2025-03-10 09:00:00' }),
    updatedAt: z
      .string()
      .nullable()
      .openapi({ example: '2025-03-10 10:00:00' }),
    append: z.boolean().openapi({
      example: true,
      description:
        'Indicates if this is a new upload (true) or existing file (false)',
    }),
  })
  .openapi('Storage.Record');

// Schema for upload request body
export const StorageCreateRequestSchema = z
  .object({
    'images[]': z.any().openapi({
      type: 'string',
      format: 'binary',
      description:
        'One or more image files to upload. Max size: 2MB per file. Supports: JPEG, PNG, GIF, WebP',
    }),
  })
  .openapi('Storage.CreateRequest');

// Schema for successful upload response
export const StorageCreateSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    message: z.string().openapi({ example: 'Images uploaded successfully' }),
    data: z.array(StorageRecordSchema).openapi({
      description: 'Array of uploaded file records',
    }),
  })
  .openapi('Storage.SuccessResponse');

// Schema for storage update request body (file replacement only)
export const StorageUpdateRequestSchema = z
  .object({
    'images[]': z.any().openapi({
      type: 'string',
      format: 'binary',
      description:
        'New image file to replace the existing one. Max size: 2MB per file. Supports: JPEG, PNG, GIF, WebP',
    }),
  })
  .openapi('Storage.UpdateRequest');

// Schema for successful update response
export const StorageUpdateSuccessResponseSchema = z
  .object({
    success: z.boolean().default(true),
    message: z
      .string()
      .openapi({ example: 'Storage record updated successfully' }),
    data: StorageRecordSchema.openapi({
      description: 'Updated storage record',
    }),
    fileReplaced: z.boolean().openapi({
      example: true,
      description: 'Indicates if the file was replaced in R2 storage',
    }),
  })
  .openapi('Storage.UpdateSuccessResponse');

// File validation constants as schema
export const UploadConstraintsSchema = z
  .object({
    maxFileSize: z.number().default(2097152).openapi({
      example: 2097152,
      description: 'Maximum file size in bytes (2MB)',
    }),
    allowedMimeTypes: z
      .array(z.string())
      .default(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
      .openapi({
        example: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        description: 'Allowed MIME types for uploads',
      }),
  })
  .openapi('Upload.Constraints');
