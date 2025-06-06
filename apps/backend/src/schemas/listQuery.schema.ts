import { z } from '@hono/zod-openapi';
import { isValidJsonArray, isValidJsonObject } from '@utils/zod.util';

export const ListQuerySchema = z
  .object({
    range: z
      .string()
      .optional()
      .refine(isValidJsonArray, {
        message:
          'range must be a valid JSON stringified array. Example: "[0, 9]"',
      })
      .openapi({
        param: {
          name: 'range',
          in: 'query',
          description:
            'Pagination range as a JSON stringified array. Example: `[0, 9]`',
          required: false,
          schema: { type: 'string', example: '[0, 9]' },
        },
      }),

    sort: z
      .string()
      .optional()
      .refine(isValidJsonArray, {
        message:
          'sort must be a valid JSON stringified array. Example: "["title", "ASC"]"',
      })
      .openapi({
        param: {
          name: 'sort',
          in: 'query',
          description:
            'Sorting criteria as a JSON stringified array. Example: `["createdAt", "DESC"]`',
          required: false,
          schema: { type: 'string', example: '["createdAt", "DESC"]' },
        },
      }),

    filter: z
      .string()
      .optional()
      .refine(isValidJsonObject, {
        message:
          'filter must be a valid JSON stringified object. Example: "{"field": "value"}"',
      })
      .openapi({
        param: {
          name: 'filter',
          in: 'query',
          description:
            'Filter criteria as a JSON stringified object. Example: `{"field": "value"}`',
          required: false,
          schema: { type: 'string' },
        },
      }),
  })
  .openapi('ListQuerySchema');
