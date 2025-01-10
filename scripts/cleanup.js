import { promises as fs } from 'fs';
import path from 'path';

const itemsToRemove = [
  'node_modules',
  'coverage',
  '.wrangler',
  '.turbo',
  '.dev.vars',
  'worker-configuration.d.ts',
  '.astro',
  'dist',
  'wrangler.json',
  'playwright-report',
  'test-results',
  '.test.vars',
];

const excludeFiles = ['wrangler.json', '.dev.vars']; // Files to exclude in the current directory

async function removeItemsInDirectory(directory, isRoot = false) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory() && itemsToRemove.includes(entry.name)) {
        console.log(`Removing directory: ${fullPath}`);
        await fs.rm(fullPath, { recursive: true, force: true });
      } else if (
        entry.isFile() &&
        itemsToRemove.includes(entry.name) &&
        !(isRoot && excludeFiles.includes(entry.name))
      ) {
        console.log(`Removing file: ${fullPath}`);
        await fs.unlink(fullPath);
      } else if (entry.isDirectory()) {
        // Recurse into subdirectories
        await removeItemsInDirectory(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error processing directory ${directory}:`, err.message);
  }
}

async function main() {
  const startDir = process.cwd(); // Start from the current working directory
  console.log(`Starting cleanup from directory: ${startDir}`);
  await removeItemsInDirectory(startDir, true);
  console.log('Cleanup complete!');
}

main().catch((err) => {
  console.error('Error during cleanup:', err.message);
});
