import { initDBInstance } from '@flarekit/database';
import { Handler, Hono } from 'hono';
import { cors } from 'hono/cors';
import { uploadHandler } from './routes/upload.route';

const app = new Hono<{ Bindings: Env }>();
app.use(cors());

const honoHomeRoute: Handler = (c) => {
  return c.json({
    success: true,
    message: 'Welcome to Flarekit APIs!',
  });
};

app.post('/upload', uploadHandler);

app.get('/', honoHomeRoute);

export { app };

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
    const db = initDBInstance(ctx, env);
    // Pass a promise
    ctx.waitUntil(
      (async () => {
        // Clear the storage every 2th minute
        if (event.cron.startsWith('*/2')) {
          const storageRecords = await db.storage.listStorageRecords();
          // Remove each storage record from
          for (const record of storageRecords) {
            await env.STORAGE.delete(record.key);
          }
          await db.storage.clearStorageRecords();
        }
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
