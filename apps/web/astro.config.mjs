// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  vite: {
    ssr: {
      noExternal: ["@package/db"],
    },
  },
  output: 'server',
  adapter: cloudflare()
});