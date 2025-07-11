import {
  StorageCreateRequestSchema,
  StorageUpdateRequestSchema,
  StorageUpdateSuccessResponseSchema,
  UploadConstraintsSchema,
} from '@/schemas/storage.schema';
import { createApiEndpoint } from '@/utils/api-builder.util';
import { initDBInstance } from '@flarekit/database';
import { DatabaseError } from '@/classes/DatabaseError.class';
import { GetOneParamSchema } from '@/schemas/getOneQuery.schema';
import { NotFoundError } from '@/classes/NotFoundError.class';
import { ValidationError } from '@/classes/ValidationError.class';
import { ExternalServiceError } from '@/classes/ExternalServiceError.class';
import { replaceFile } from '@utils/upload.util';

// Get upload constraints from schema
const uploadConstraints = UploadConstraintsSchema.parse({});
const MAX_FILE_SIZE = uploadConstraints.maxFileSize;
const ALLOWED_MIME_TYPES = uploadConstraints.allowedMimeTypes;

export const storageUpdateEndpoint = createApiEndpoint({
  resource: 'Storage',
  method: 'put',
  path: '/api/v1/storage/{id}',
  responseSchema: StorageUpdateSuccessResponseSchema,
  request: {
    params: GetOneParamSchema,
    body: {
      content: {
        'multipart/form-data': {
          schema: StorageCreateRequestSchema,
        },
      },
    },
  },
  handler: async (c) => {
    try {
      const db = initDBInstance(c.env, c.env);
      const id = c.req.param('id');

      // Check if storage record exists
      const existingStorage = await db.storage.getById(id).catch((error) => {
        throw DatabaseError.schemaError(
          'storage',
          'Failed to fetch storage record',
          {
            originalError: error.message,
            query: { id },
          },
        );
      });

      if (!existingStorage) {
        throw new NotFoundError('Storage', id);
      }

      // Parse the multipart form data
      const body = await c.req.parseBody();
      let newFile = body?.['images[]'] as File | undefined;

      if (!newFile || !(newFile instanceof File)) {
        throw new ValidationError('No file provided for replacement', [
          {
            field: 'images[]',
            code: 'REQUIRED',
            message: 'File is required for PUT operation',
          },
        ]);
      }

      // Validate the new file
      if (
        !ALLOWED_MIME_TYPES.includes(newFile.type) ||
        newFile.size > MAX_FILE_SIZE
      ) {
        const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
        const allowedTypes = ALLOWED_MIME_TYPES.map((type) =>
          type.split('/')[1].toUpperCase(),
        ).join(', ');
        throw new ValidationError('Invalid file', [
          {
            field: 'images[]',
            code: 'INVALID_FILE',
            message: `Please ensure file is ${allowedTypes} image under ${maxSizeMB}MB`,
            value: {
              name: newFile.name,
              size: newFile.size,
              type: newFile.type,
            },
          },
        ]);
      }

      // Replace the file in R2 and get new file data
      let newFileData;
      try {
        newFileData = await replaceFile(newFile, existingStorage.key, c.env);
      } catch (ex) {
        if (ex instanceof Error) {
          throw ExternalServiceError.serviceUnavailable(
            'File storage service',
            {
              originalError: ex.message,
              operation: 'file_replacement',
              oldKey: existingStorage.key,
              newFile: {
                name: newFile.name,
                size: newFile.size,
                type: newFile.type,
              },
            },
          );
        }
        throw ExternalServiceError.serviceUnavailable('File storage service', {
          operation: 'file_replacement',
          oldKey: existingStorage.key,
        });
      }

      // Update the storage record with new file data
      const updateData = {
        key: newFileData.key,
        originalName: newFileData.originalName,
        size: newFileData.size,
        mimeType: newFileData.mimeType,
        hash: newFileData.hash,
      };

      const updatedStorage = await db.storage
        .update(id, updateData)
        .catch((error) => {
          // If file was replaced but DB update failed, we should ideally rollback
          // For now, we'll log the issue and throw the error
          console.error('File was replaced but database update failed:', error);
          // In a production system, you might want to implement compensation logic here

          throw DatabaseError.schemaError(
            'storage',
            'Failed to update storage record after file replacement',
            {
              originalError: error.message,
              query: { id, updateData },
              fileReplaced: true,
            },
          );
        });

      return c.json(
        {
          success: true,
          message: 'Storage record and file updated successfully',
          data: updatedStorage,
          fileReplaced: true,
        },
        200,
      );
    } catch (error) {
      console.log(error);
      // Re-throw if it's already one of our custom errors
      if (
        error instanceof DatabaseError ||
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof ExternalServiceError
      ) {
        throw error;
      }
      // Wrap unexpected errors
      throw DatabaseError.schemaError(
        'storage',
        'Failed to process storage update request',
        {
          originalError:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      );
    }
  },
});
