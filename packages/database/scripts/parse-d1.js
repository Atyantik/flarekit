import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the wrangler.json file
const WRANGLER_JSON_PATH = path.resolve(__dirname, '..', 'wrangler.json');

// Read and parse the wrangler.json file
async function getD1DatabaseName(binding) {
  try {
    const wranglerConfig = JSON.parse(
      await fs.readFile(WRANGLER_JSON_PATH, 'utf-8'),
    );

    // Find the d1 database with the specified binding
    const d1Database = wranglerConfig.d1_databases.find(
      (db) => db.binding === binding,
    );
    if (!d1Database) {
      console.error(`No D1 database found with binding "${binding}".`);
      process.exit(1);
    }

    return d1Database.database_name;
  } catch (error) {
    console.error(
      `Error reading or parsing ${WRANGLER_JSON_PATH}:`,
      error.message,
    );
    process.exit(1);
  }
}

// Use the binding name "DB" to fetch the database_name
const databaseName = await getD1DatabaseName('DB');

// Do not remove this console.log as this is used by stdin to get the database name
console.log(databaseName);
