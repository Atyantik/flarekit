import { z } from '@hono/zod-openapi';
import { StorageRecordSchema } from '@/schemas/storage.schema';
import { createApiEndpoint } from '@/utils/api-builder.util';
import { ListQuerySchema } from '@/schemas/listQuery.schema';
import { initDBInstance } from '@flarekit/database';
import { ValidationError } from '@/classes/ValidationError.class';
import { DatabaseError } from '@/classes/DatabaseError.class';

type StorageSortField =
  | 'id'
  | 'key'
  | 'originalName'
  | 'size'
  | 'mimeType'
  | 'hash'
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt';

export const storageListEndpoint = createApiEndpoint({
  resource: 'Storage',
  method: 'get',
  path: '/api/v1/storage',
  responseSchema: z.array(StorageRecordSchema),
  request: {
    query: ListQuerySchema,
  },
  handler: async (c) => {
    try {
      const db = initDBInstance(c.env, c.env);
      const query = c.req.valid('query');
      const { range, sort, filter } = query;

      let parsedRange: [number, number];
      let parsedSort: [StorageSortField, 'ASC' | 'DESC'];
      let parsedFilter: Record<string, any>;

      try {
        parsedRange = range ? JSON.parse(range) : [0, 9];
        parsedSort = sort ? JSON.parse(sort) : ['createdAt', 'DESC'];
        parsedFilter = filter ? JSON.parse(filter) : {};
      } catch (error) {
        throw new ValidationError('Invalid query parameters', [
          {
            field: 'query',
            code: 'INVALID_JSON',
            message: 'Query parameters must be valid JSON',
            value: { range, sort, filter },
          },
        ]);
      }

      // Validate range format
      if (
        !Array.isArray(parsedRange) ||
        parsedRange.length !== 2 ||
        typeof parsedRange[0] !== 'number' ||
        typeof parsedRange[1] !== 'number'
      ) {
        throw new ValidationError('Invalid range parameter', [
          {
            field: 'range',
            code: 'INVALID_FORMAT',
            message: 'Range must be an array of two numbers [start, end]',
            value: parsedRange,
          },
        ]);
      }

      // Validate sort format
      if (
        !Array.isArray(parsedSort) ||
        parsedSort.length !== 2 ||
        !['ASC', 'DESC'].includes(parsedSort[1])
      ) {
        throw new ValidationError('Invalid sort parameter', [
          {
            field: 'sort',
            code: 'INVALID_FORMAT',
            message:
              'Sort must be an array of [field, direction] where direction is ASC or DESC',
            value: parsedSort,
          },
        ]);
      }

      // Fetch paginated content
      const storageList = await db.storage
        .getList(parsedRange, parsedSort, {
          ...(parsedFilter || {}),
        })
        .catch((error) => {
          throw DatabaseError.schemaError(
            'storage',
            'Failed to fetch storage list',
            {
              originalError: error.message,
              query: {
                range: parsedRange,
                sort: parsedSort,
                filter: parsedFilter,
              },
            },
          );
        });

      const totalItems = await db.storage
        .getCount(parsedFilter)
        .catch((error) => {
          throw DatabaseError.schemaError(
            'storage',
            'Failed to count storage items',
            {
              originalError: error.message,
              query: { filter: parsedFilter },
            },
          );
        });

      return c.json(storageList, 200, {
        'Content-Range': `storage ${parsedRange[0]}-${parsedRange[1]}/${totalItems}`,
        'Access-Control-Expose-Headers': 'Content-Range',
      });
    } catch (error) {
      // Re-throw if it's already one of our custom errors
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      // Wrap unexpected errors
      throw DatabaseError.schemaError(
        'storage',
        'Failed to process storage list request',
        {
          originalError:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      );
    }
  },
});
