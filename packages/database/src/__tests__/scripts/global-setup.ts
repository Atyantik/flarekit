import { Miniflare } from "miniflare";
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, afterAll } from "vitest";
import { applyMigrations } from "./migration-runner";
import { AnyD1Database } from "drizzle-orm/d1";


const __dirname = dirname(fileURLToPath(import.meta.url));

let mf: Miniflare;
let db: AnyD1Database;

export const setupMiniflare = async () => {
  mf = new Miniflare({
    modules: true,
    d1Databases: {
      DB: ":memory:", // Use an in-memory SQLite database for testing
    },
    script: `
      export default {
        async fetch(request, env, ctx) {
          return new Response("Hello Miniflare!");
        }
      }
    `,
  });
  try {

    const env = await mf.getBindings();
    db = env.DB; // Get the D1 database binding from Miniflare

    // Apply migrations from the migrations directory
    await applyMigrations(db, join(
      __dirname,
      '..',
      '..',
      '..',
      'migrations',
    ));

    console.log("Migrations applied to in-memory database.");
  } catch (ex) {
    console.error(ex);
  }
};

export const disposeMiniflare = async () => await mf.dispose(); // Clean up Miniflare

beforeAll(setupMiniflare);
afterAll(disposeMiniflare);

export const getTestDatabase = () => db; // Provide access to the test database

