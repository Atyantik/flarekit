import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "compile", // Change to "cloudflare" if using cloudflare images
    platformProxy: {
      enabled: true,
      persist: {
        path: "../../.wrangler/state/v3",
      },
    },
  }),
  security: {
    checkOrigin: false,
  },
  vite: {
    optimizeDeps: {
      include: ["@flarekit/database"],
    },
    build: {
      rollupOptions: {
        external: ["node:crypto"],
      },
    },
    plugins: [tailwindcss()],
  },
});
