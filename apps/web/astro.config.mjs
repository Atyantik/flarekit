// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: {
        path: "../../.wrangler/state/v3",
      },
    },
  }),
  vite: {
    optimizeDeps: {
      include: ["@services/database"],
    },
  },
});
