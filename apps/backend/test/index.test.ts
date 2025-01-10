import { env } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import { app } from '../src/index';

describe('Example', () => {
  it('Should return 200 response', async () => {
    const res = await app.request('/', {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      message: 'Welcome to Flarekit Backend!',
    });
  });
});
