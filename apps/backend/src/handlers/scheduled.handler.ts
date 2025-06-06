import { initDBInstance } from '@flarekit/database';

export const scheduledHandler: ExportedHandlerScheduledHandler<Env> = (
  event,
  env,
  ctx,
) => {
  const db = initDBInstance(ctx, env);
  // Pass a promise
  ctx.waitUntil(
    (async () => {
      // Clear the storage every 2th minute
      if (event.cron.startsWith('*/2')) {
        const storageRecords = await db.storage.getList();
        // Remove each storage record from the storage
        const idsToRemove = [];
        for (const record of storageRecords) {
          idsToRemove.push(record.id);
          await env.STORAGE.delete(record.key);
        }
        await db.storage.bulkDelete(idsToRemove, true);
      }
    })(),
  );
};
