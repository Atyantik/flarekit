// global.d.ts or env.d.ts (make sure it's included in tsconfig.json "include")
import { initDBInstance } from "@flarekit/database";
import type { Runtime } from "@astrojs/cloudflare";

declare global {
  // or "declare module 'astro' { ... }" if you’re augmenting Astro’s types
  namespace App {
    interface Locals extends Runtime<Env> {
      REQUEST_TIME: number;
      // If initDBInstance is async, you might need Awaited<>
      DB: ReturnType<typeof initDBInstance>;
    }
  }
}

// Required for the file to be treated as a module
export { };
