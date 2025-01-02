import { Handler, Hono } from 'hono';
// import { clearStorageRecords, getDBClient, listStorageRecords } from '@flarekit/database';

const app = new Hono<{ Bindings: Env }>();

const honoHomeRoute: Handler = (c) => {
  return c.json({
    message: 'Welcome to Hono!',
  });
};
app.get('/', honoHomeRoute);

export default {
  fetch: app.fetch,
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
        // if (event.cron.startsWith('*/5')) {
        //   const DB = await getDBClient(this, env.DB);
        //   const STORAGE = env.STORAGE;
        //   const CACHE = env.CACHE;
        //   // Get all storage Records
        //   const storageRecords = await listStorageRecords(DB);
        //   // Remove each storage record from
        //   for (const record of storageRecords) {
        //     await STORAGE.delete(record.key);
        //   }
        //   await clearStorageRecords(DB);
        //   await CACHE.delete('storage_records');
        // }
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
