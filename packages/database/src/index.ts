import { drizzle } from 'drizzle-orm/d1';
import { schemas } from './schemas';
import type { Ctx } from './types';
import { services } from './services';
import { ServiceError } from './classes/service_error.class';
import { slugify } from '@utils/slugify.util';

const drizzleDBMap = new WeakMap<object, Ctx>();

export const getInstance = (reference: object) => {
  return drizzleDBMap.get(reference);
};
export const initDBInstance = (reference: object, env: Env) => {
  let instance = drizzleDBMap.get(reference);

  if (!instance) {
    const db = drizzle(env.DB, {
      schema: schemas,
    });
    instance = {
      db,
    };
    drizzleDBMap.set(reference, instance);
  }

  return services(instance);
};

export { ServiceError, slugify };

export default {
  initDBInstance,
  getInstance,
  ServiceError,
  slugify,
};
