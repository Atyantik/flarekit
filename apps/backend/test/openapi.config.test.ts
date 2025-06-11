import { describe, it, expect } from 'vitest';
import { createOpenAPIApp } from '../src/config/openapi.config';

const app = createOpenAPIApp();

describe('OpenAPI endpoints', () => {
  it('serves the OpenAPI specification', async () => {
    const res = await app.request('/specification.json');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.openapi).toBe('3.1.1');
  });

  it('serves the Swagger UI page', async () => {
    const res = await app.request('/docs');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
  });
});
