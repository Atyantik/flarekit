// import { env, createExecutionContext } from 'cloudflare:test';
// import { describe, it, expect } from 'vitest';
// import { app } from '@/index';
// import { initDBInstance } from '@flarekit/database';

// /** Ensure the storage list route returns Content-Range header using storage prefix */

// describe('Storage List Route', () => {
//   it('returns Content-Range header with storage prefix', async () => {
//     const ctx = createExecutionContext();
//     const db = initDBInstance(ctx, env);

//     await db.storage.create({
//       key: 'test-key',
//       originalName: 'file.txt',
//       size: 10,
//       mimeType: 'text/plain',
//       hash: 'abc',
//     });

//     const res = await app.request('/api/v1/storage?range=[0,0]', {}, env);
//     expect(res.status).toBe(200);
//     const header = res.headers.get('Content-Range');
//     expect(header).toBe(`storage 0-0/1`);
//   });
// });
