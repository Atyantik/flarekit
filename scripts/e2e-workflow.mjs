#!/usr/bin/env node

import { Socket } from 'node:net';
import { URL } from 'node:url';
import { spawn } from 'node:child_process';

let loggingDisabled = false;

/**
 * Disable all further logging from the parent process
 * and prevent child outputs from being written to stdout/stderr.
 */
function disableLogging() {
  loggingDisabled = true;

  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

/**
 * Spawn a child process and pipe its output to parent’s stdout/stderr
 * while optionally prefixing each line. Color codes are retained.
 */
function spawnProcess(command, args = [], processName = '') {
  // We pass FORCE_COLOR=true to preserve color in child process output
  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: 'true' },
    shell: true,
  });

  // Capture child's stdout
  child.stdout.on('data', (data) => {
    if (!loggingDisabled) {
      // preserve child's color codes
      process.stdout.write(data);
    }
  });

  // Capture child's stderr
  child.stderr.on('data', (data) => {
    if (!loggingDisabled) {
      process.stderr.write(data);
    }
  });

  child.on('error', (err) => {
    if (!loggingDisabled) {
      console.error(`Error spawning ${processName || command}:`, err);
    }
  });

  child.on('close', (code) => {
    if (!loggingDisabled) {
      console.log(`${processName || command} exited with code ${code}`);
    }
  });

  return child;
}

function killProcess(child, name = 'child process') {
  if (!child || !child.pid) {
    if (!loggingDisabled) {
      console.log(`${name} is not running or already terminated.`);
    }
    return;
  }

  if (!loggingDisabled) {
    // console.log(`Sending SIGINT to ${name} (PID: ${child.pid})...`);
  }
  try {
    child.kill('SIGINT');
  } catch (err) {
    if (!loggingDisabled) {
      console.error(
        `Error sending SIGINT to ${name} (PID: ${child.pid}):`,
        err,
      );
    }
    return;
  }

  // OPTIONAL fallback to SIGKILL if the child doesn’t exit in 2 seconds
  setTimeout(() => {
    if (child.exitCode === null) {
      if (!loggingDisabled) {
        console.warn(
          `${name} is still running (PID: ${child.pid}), sending SIGKILL...`,
        );
      }
      try {
        child.kill('SIGKILL');
      } catch (killErr) {
        if (!loggingDisabled) {
          console.error(`Error sending SIGKILL to ${name}:`, killErr);
        }
      }
    }
  }, 2000);
}

function cleanUp() {
  if (!loggingDisabled) {
    // console.log('Cleaning up processes...');
  }
  killProcess(previewProcess, 'Preview process');
  killProcess(testProcess, 'Test process');
}

const DEFAULT_TIMEOUT = 60000;
let previewProcess = null;
let testProcess = null;

async function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new Socket();
    socket.setTimeout(2000); // 2s timeout

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
  if (!loggingDisabled) {
    console.log(
      `Waiting for the following hosts/ports to be available: ${hostPorts
        .map(([host, port]) => `${host}:${port}`)
        .join(', ')}`,
    );
  }

  const startTime = Date.now();

  while (true) {
    const checks = hostPorts.map(([host, port]) => checkPort(host, port));
    const available = await Promise.all(checks);
    if (available.every(Boolean)) {
      if (!loggingDisabled) {
        console.log('All hosts/ports are now available!');
      }
      return true;
    }

    if (Date.now() - startTime > timeout) {
      if (!loggingDisabled) {
        console.error(
          'Timeout reached while waiting for hosts/ports to become available.',
        );
      }
      return false;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function main() {
  process.on('SIGINT', () => {
    if (!loggingDisabled) {
      console.log('\nReceived SIGINT. Exiting...');
    }
    cleanUp();
    disableLogging();
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    if (!loggingDisabled) {
      console.log('Received SIGTERM. Exiting...');
    }
    cleanUp();
    disableLogging();
    process.exit(1);
  });

  process.on('exit', () => {
    cleanUp();
    disableLogging();
  });

  const args = process.argv.slice(2);

  const hostPorts = [];
  let timeout = DEFAULT_TIMEOUT;
  let watch = false;

  for (const arg of args) {
    if (arg.startsWith('--wait-for=')) {
      const urlStr = arg.split('=', 2)[1];
      const parsed = new URL(urlStr);

      if (!parsed.hostname || !parsed.port) {
        if (!loggingDisabled) {
          console.error(`Invalid URL format: ${urlStr}`);
        }
        process.exit(1);
      }

      hostPorts.push([parsed.hostname, Number.parseInt(parsed.port, 10)]);
    } else if (arg.startsWith('--timeout=')) {
      timeout = Number.parseInt(arg.split('=', 2)[1], 10) * 1000;
    } else if (arg.startsWith('--watch')) {
      watch = true;
    }
  }

  if (hostPorts.length === 0) {
    if (!loggingDisabled) {
      console.info(
        'Usage: npx e2e ' +
          '--wait-for="http://<host>:<port>" ' +
          '--wait-for="http://<host2>:<port2>" --timeout=<seconds>',
      );
    }
    process.exit(1);
  }

  // Start the preview process, preserving color codes
  previewProcess = spawnProcess('npm', ['run', 'preview'], 'Preview process');

  previewProcess.on('error', (err) => {
    if (!loggingDisabled) {
      console.error('Failed to start preview process:', err);
    }
    process.exit(1);
  });

  // Wait for the required ports to be available
  const success = await waitForPorts(hostPorts, timeout);

  if (success) {
    if (!loggingDisabled) {
      console.log('Running E2E tests...');
    }
    // Start E2E test process
    testProcess = spawnProcess(
      'npx',
      ['flarekit', watch ? 'test:e2e:watch' : 'test:e2e', '--ui=stream'],
      'Test process',
    );

    testProcess.on('close', (code) => {
      if (!loggingDisabled) {
        console.log(`E2E tests exited with code ${code}`);
      }
      cleanUp();
      disableLogging();
      process.exit(code);
    });

    testProcess.on('error', (err) => {
      if (!loggingDisabled) {
        console.error('Failed to start E2E tests:', err);
      }
      cleanUp();
      disableLogging();
      process.exit(1);
    });
  } else {
    if (!loggingDisabled) {
      console.error('Ports were not available within the timeout.');
    }
    cleanUp();
    disableLogging();
    process.exit(1);
  }
}

main().catch((err) => {
  if (!loggingDisabled) {
    console.error('Error:', err);
  }
  cleanUp();
  disableLogging();
  process.exit(1);
});
