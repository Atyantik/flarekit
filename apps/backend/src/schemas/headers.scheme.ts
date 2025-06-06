import { z } from '@hono/zod-openapi';

export const HeadersSchema = z.object({
  // Header keys must be in lowercase, `Authorization` is not allowed.
  authorization: z.string().openapi({
    example: 'Bearer AUTH_TOKEN',
  }),
});
