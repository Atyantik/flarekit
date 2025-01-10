#!/usr/bin/env node
import { Socket } from 'node:net';
import { URL } from 'node:url';
import { spawn } from 'node:child_process';

// Default timeout (in milliseconds)
const DEFAULT_TIMEOUT = 60000;

async function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new Socket();

    socket.setTimeout(2000); // Timeout in 2 seconds
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function waitForPorts(hostPorts, timeout) {
  console.log(
    `Waiting for the following hosts/ports to be available: ${hostPorts.join(', ')}`,
  );

  const startTime = Date.now();
  while (true) {
    const available = await Promise.all(
      hostPorts.map(async ([host, port]) => {
        return checkPort(host, port);
      }),
    );

    if (available.every((status) => status)) {
      console.log('All hosts/ports are now available!');
      return true;
    }

    if (Date.now() - startTime > timeout) {
      console.error(
        'Timeout reached while waiting for hosts/ports to become available.',
      );
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
  }
}

async function main() {
  // Parse arguments
  const args = process.argv.slice(2);

  const hostPorts = [];
  let timeout = DEFAULT_TIMEOUT;
  let watch = false;

  args.forEach((arg) => {
    if (arg.startsWith('--wait-for=')) {
      const target = arg.split('=', 2)[1];
      const parsed = new URL(target);
      if (!parsed.hostname || !parsed.port) {
        console.error(`Invalid URL format: ${target}`);
        process.exit(1);
      }
      hostPorts.push([parsed.hostname, parseInt(parsed.port, 10)]);
    } else if (arg.startsWith('--timeout=')) {
      timeout = parseInt(arg.split('=', 2)[1], 10) * 1000;
    } else if (arg.startsWith('--watch')) {
      watch = true;
    }
  });

  if (hostPorts.length === 0) {
    console.info(
      'Usage: node ./scripts/e2e-workflow.js --wait-for="http://<host>:<port>" --wait-for="http://<host2>:<port2>" --timeout=<seconds>',
    );
  }

  console.log('Starting npm run preview...');
  const previewProcess = spawn('npm', ['run', 'preview'], {
    stdio: 'inherit',
  });

  previewProcess.on('error', (err) => {
    console.error('Failed to start preview process:', err);
    process.exit(1);
  });

  // Wait for ports to be available
  const success = await waitForPorts(hostPorts, timeout);

  if (success) {
    console.log('Running E2E tests...');
    const testProcess = spawn(
      'npx',
      ['flarekit', watch ? 'test:e2e:watch' : 'test:e2e', '--ui=stream'],
      {
        stdio: 'inherit',
      },
    );

    testProcess.on('close', (code) => {
      console.log(`E2E tests exited with code ${code}`);
      previewProcess.kill(); // Kill the preview process
      process.exit(code);
    });

    testProcess.on('error', (err) => {
      console.error('Failed to start E2E tests:', err);
      previewProcess.kill(); // Kill the preview process
      process.exit(1);
    });
  } else {
    console.error('Ports were not available within the timeout.');
    previewProcess.kill(); // Kill the preview process
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
