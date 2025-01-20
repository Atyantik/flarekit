#!/usr/bin/env node
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { init } from './setup-wrangler.mjs';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(dirname(fileURLToPath(import.meta.url))));

async function main() {
  // 1. Run setup
  await init();

  // 2. Build the turbo command + arguments
  const [, , ...args] = process.argv;
  const turboArgs = args; // e.g. ['run', 'preview'] or whatever you pass
  console.log(`Executing turbo with args: ${turboArgs.join(' ')}`);

  // 3. Spawn Turbo
  const turboProcess = spawn('npx', ['turbo', ...turboArgs], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  });

  // 4. Cleanup function
  function cleanupAndExit(exitCode = 1) {
    console.log('Cleaning up Turbo (and children if possible)...');

    if (turboProcess.pid) {
      console.log(`Sending SIGINT to Turbo (PID: ${turboProcess.pid})...`);
      try {
        // Graceful shutdown first
        turboProcess.kill('SIGINT');
      } catch (err) {
        console.error(`Failed to send SIGINT to Turbo: ${err}`);
        // If we failed to send SIGINT at all, just exit.
        process.exit(exitCode);
      }

      // Fallback: escalate to SIGKILL if Turbo hasn’t exited in 2 seconds
      setTimeout(() => {
        if (turboProcess.exitCode === null) {
          console.warn('Turbo did not exit; escalating to SIGKILL...');
          try {
            turboProcess.kill('SIGKILL');
          } catch (killErr) {
            console.error('Failed to send SIGKILL to Turbo:', killErr);
          }
        }
        // Finally exit our script
        process.exit(exitCode);
      }, 2000);
    } else {
      // If for some reason we don't have a PID, just exit.
      process.exit(exitCode);
    }
  }

  // 5. Handle signals in *this* script so we can kill Turbo gracefully
  process.on('SIGINT', () => {
    console.log('Received SIGINT - stopping Turbo.');
    cleanupAndExit(1);
  });

  process.on('SIGTERM', () => {
    console.log('Received SIGTERM - stopping Turbo.');
    cleanupAndExit(1);
  });

  // 6. Listen for Turbo’s exit event
  turboProcess.on('close', (code) => {
    console.log(`Turbo exited with code ${code}`);
    cleanupAndExit(code);
  });

  // 7. If an error occurs when spawning
  turboProcess.on('error', (err) => {
    console.error('Failed to start Turbo:', err);
    cleanupAndExit(1);
  });
}

main().catch((err) => {
  console.error('Error in main:', err);
  process.exit(1);
});
