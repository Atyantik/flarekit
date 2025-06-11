import { initDBInstance } from '@flarekit/database';
import { computeShortHash } from './hash.util';

export const uploadFiles = async (files: File[], env: Env) => {
  const db = initDBInstance(env, env);
  // signatures than the one from the worker
  const storage = env.STORAGE;
  if (!storage) {
    throw new Error('You need to add storage binding to the environment.');
  }

  // Upload all files parallel
  return Promise.all(
    files.map(async (file) => {
      const fileBuffer = await file.arrayBuffer();
      const hash = await computeShortHash(fileBuffer);
      const key = `${hash}-${file.name}`;
      const recordedStorage = (
        await db.storage.getList(undefined, undefined, { key })
      )?.[0];
      if (!recordedStorage) {
        await storage.put(key, fileBuffer, {
          httpMetadata: {
            contentType: file.type,
          },
        });
        const newRecord = await db.storage.create({
          key,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          hash: hash,
        });
        return { ...newRecord, append: true };
      }
      return { ...recordedStorage, append: false };
    }),
  );
};
