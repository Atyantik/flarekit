import { defineMiddleware } from "astro:middleware";
import { initDBInstance } from "@flarekit/database";

export const onRequest = defineMiddleware(async (context, next) => {
  // intercept data from a request
  // optionally, modify the properties in `locals`
  context.locals.DB = initDBInstance(context, context.locals.runtime.env);

  // return a Response or the result of calling `next()`
  return next();
});
