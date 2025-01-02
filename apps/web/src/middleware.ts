import { defineMiddleware } from "astro:middleware";
import { initDBInstance } from "@flarekit/database";

export const onRequest = defineMiddleware(async (context, next) => {
  // intercept data from a request
  // optionally, modify the properties in `locals`
  context.locals.DB = await initDBInstance(context, context.locals.runtime.env);

  context.locals.DB.storage;

  // return a Response or the result of calling `next()`
  return next();
});
