import { StorageRecordSchema } from '@/schemas/storage.schema';
import { createApiEndpoint } from '@/utils/api-builder.util';
import { initDBInstance } from '@flarekit/database';
import { DatabaseError } from '@/classes/DatabaseError.class';
import { GetOneParamSchema } from '@/schemas/getOneQuery.schema';
import { NotFoundError } from '@/classes/NotFoundError.class';

export const storageGetOneEndpoint = createApiEndpoint({
  resource: 'Storage',
  method: 'get',
  path: '/api/v1/storage/{id}',
  responseSchema: StorageRecordSchema,
  request: {
    params: GetOneParamSchema,
  },
  handler: async (c) => {
    try {
      const db = initDBInstance(c.env, c.env);
      const id = c.req.param('id');

      console.log(':id', id);
      const storage = await db.storage.getById(id).catch((error) => {
        throw DatabaseError.schemaError(
          'storage',
          'Failed to fetch storage record',
          {
            originalError: error.message,
            query: { id },
          },
        );
      });

      if (!storage) {
        throw new NotFoundError('Storage', id);
      }

      return c.json(storage, 200);
    } catch (error) {
      console.log(error);
      // Re-throw if it's already one of our custom errors
      if (error instanceof DatabaseError) {
        throw error;
      }
      // Wrap unexpected errors
      throw DatabaseError.schemaError(
        'storage',
        'Failed to process storage get one request',
        {
          originalError:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      );
    }
  },
});
