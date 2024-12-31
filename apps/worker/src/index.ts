import type { ExportedHandler } from '@cloudflare/workers-types';
import {
  clearStorageRecords,
  getDBClient,
  listStorageRecords,
} from '@services/database';

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const DB = await getDBClient(this, env.DB);
    let storageRecords: Record<string, unknown>[] = [];
    try {
      storageRecords = await listStorageRecords(DB);
    } catch {
      // Do nothing
    }

    const data = {
      ctx,
      storageRecords,
      headers: Object.fromEntries(request.headers.entries()),
      env: Object.keys(env),
      method: request.method,
      url: request.url,
    };
    return new Response(JSON.stringify(data, null, 2), {
      headers: { 'content-type': 'application/json' },
    });
  },

  /* istanbul ignore next: Cannot test Queue invocation */
  // async queue( batch: MessageBatch, env: Environment, ctx: ExecutionContext)
  async queue(batch): Promise<void> {
    let messages = JSON.stringify(batch.messages);
    console.log(`Consumed from our queue: ${messages}`);
    batch.ackAll();
  },

  /* istanbul ignore next: Cannot test scheduled invocation */
  // scheduled(event: ScheduledEvent, env: Environment, ctx: ExecutionContext)
  async scheduled(event, env, ctx) {
    // Pass a promise
    ctx.waitUntil(
      (async () => {
        // Clear the storage every 5th minute
        if (new Date().getMinutes() % 5 === 0) {
          const DB = await getDBClient(this, env.DB);
          const STORAGE = env.STORAGE;
          const CACHE = env.CACHE;
          DB.transaction(async (tx) => {
            // Get all storage Records
            const storageRecords = await listStorageRecords(tx);
            // Remove each storage record from
            for (const record of storageRecords) {
              await STORAGE.delete(record.key);
            }
            await clearStorageRecords(tx);
            await CACHE.delete('storage_records');
          });
        }
      })(),
    );
  },
  // eslint-disable-next-line no-undef
} satisfies ExportedHandler<Env>;
