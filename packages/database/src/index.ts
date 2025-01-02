import { drizzle } from 'drizzle-orm/d1';
import { createFlarekitServices } from './proxy';
import * as services from './services';
import type { Ctx } from './types';

const drizzleDBMap = new WeakMap<object, Ctx>();

export const getInstance = (reference: object) => {
  return drizzleDBMap.get(reference);
};
export const initDBInstance = (reference: object, env: Env) => {
  let instance = drizzleDBMap.get(reference);

  if (!instance) {
    const db = drizzle(env.DB);
    instance = {
      db,
      cache: env.CACHE,
      queue: env.QUEUE,
    };
    drizzleDBMap.set(reference, instance);
  }

  // Wrap the "services" in the "createFlarekitServices" proxy
  return createFlarekitServices(instance, services);
};
