import { describe, it, expect } from 'vitest';
import { buildStandardResponses } from '../../src/utils/response-builder.util';
import { z } from '@hono/zod-openapi';

describe('buildStandardResponses', () => {
  const schema = z.object({ ok: z.boolean() });

  it('generates responses for a list route', () => {
    const responses = buildStandardResponses({
      method: 'get',
      path: '/items',
      resourceName: 'Item',
      responseSchema: schema,
      requiresAuth: false,
    });
    expect(responses['200']).toBeDefined();
    expect(responses['404']).toBeUndefined();
    expect(responses['401']).toBeUndefined();
  });

  it('includes auth errors when authentication is required', () => {
    const responses = buildStandardResponses({
      method: 'post',
      path: '/items',
      resourceName: 'Item',
      responseSchema: schema,
      requiresAuth: true,
    });
    expect(responses['201']).toBeDefined();
    expect(responses['401']).toBeDefined();
    expect(responses['403']).toBeDefined();
  });

  it('includes 404 for routes with path variables', () => {
    const responses = buildStandardResponses({
      method: 'get',
      path: '/items/{id}',
      resourceName: 'Item',
      responseSchema: schema,
      requiresAuth: false,
    });
    expect(responses['200']).toBeDefined();
    expect(responses['404']).toBeDefined();
  });
});
