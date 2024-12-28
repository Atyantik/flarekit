import { defineMiddleware } from 'astro:middleware';
import { getDBClient } from '@services/database';

export const onRequest = defineMiddleware(async (context, next) => {
  // intercept data from a request
  // optionally, modify the properties in `locals`
  context.locals.dbClient = await getDBClient(
    context,
    context.locals.runtime.env.DB,
  );

  // return a Response or the result of calling `next()`
  return next();
});
