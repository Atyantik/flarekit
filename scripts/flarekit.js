#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { init } from './setup-wrangler.js';

const rootDir = resolve(dirname(new URL(import.meta.url).pathname), '..');

// Collect the arguments passed to the script (excluding node and the script itself)
const [, , ...args] = process.argv;
// Build the turbo command with additional arguments
const turboCommand = `npx turbo ${args.join(' ')}`;

try {
  // Run the setup script
  await init();

  // Pass remaining arguments to turbo
  console.log(`Executing: ${turboCommand}`);
  execSync(turboCommand, { cwd: rootDir, stdio: 'inherit' });
} catch (error) {
  console.error('Error during execution:', error.message);
  process.exit(1);
}
