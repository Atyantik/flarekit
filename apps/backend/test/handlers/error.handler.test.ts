import { Hono } from 'hono';
import { describe, it, expect, beforeEach } from 'vitest';
import { handleError } from '../../src/handlers/error.handler';
import { ValidationError } from '../../src/classes/ValidationError.class';
import { z } from '@hono/zod-openapi';

const createApp = () => {
  const app = new Hono();
  app.onError((err, c) => handleError(err, c));
  return app;
};

describe('handleError', () => {
  let app: ReturnType<typeof createApp>;
  beforeEach(() => {
    app = createApp();
  });

  it('handles BaseError instances', async () => {
    app.get('/base', () => {
      throw new ValidationError('Invalid', [
        { field: 'name', code: 'REQUIRED', message: 'name required' },
      ]);
    });
    const res = await app.request('/base');
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.requestId).toBeDefined();
  });

  it('converts ZodError to ValidationError', async () => {
    const schema = z.object({ name: z.string() });
    app.get('/zod', () => {
      schema.parse({});
      return new Response();
    });
    const res = await app.request('/zod');
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  it('wraps unknown errors in SystemError', async () => {
    app.get('/unknown', () => {
      throw new Error('boom');
    });
    const res = await app.request('/unknown');
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.code).toBe('UNEXPECTED_ERROR');
    expect(data.requestId).toBeDefined();
  });
});
