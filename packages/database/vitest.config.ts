import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./tests/scripts/global-setup.ts"], // Add global setup here
  },
});