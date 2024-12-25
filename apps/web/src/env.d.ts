type DrizzleD1Database = import('drizzle-orm/d1').DrizzleD1Database;
type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    dbClient: DrizzleD1Database;
  }
}