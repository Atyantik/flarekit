import { z } from '@hono/zod-openapi';

export const GetOneParamSchema = z
  .object({
    id: z.string().openapi({
      param: {
        name: 'id',
        in: 'path',
        description: 'The unique identifier of the resource',
        required: true,
        schema: { type: 'string' },
      },
    }),
  })
  .openapi('GetOneParamSchema');
