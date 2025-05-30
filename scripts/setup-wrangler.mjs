import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, resolve, join, isAbsolute } from 'node:path';
import { exec } from 'node:child_process';
import { glob } from 'glob';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootWranglerConfig = await import('../wrangler.json', {
  with: { type: 'json' },
  assert: { type: 'json' },
}).then((module) => module.default);

const packageJson = await import('../package.json', {
  with: { type: 'json' },
  assert: { type: 'json' },
}).then((module) => module.default);

const workspaces = packageJson?.workspaces ?? [];
const rootDir = resolve(dirname(dirname(fileURLToPath(import.meta.url))));

/**
 * This function is a deep merge function that merges two objects
 * @param object oConfig
 * @param object pConfig
 * @returns
 */
function deepMerge(oConfig, pConfig) {
  let originalConfig =
    typeof oConfig === 'object' ? JSON.parse(JSON.stringify(oConfig)) : oConfig;
  let packageConfig =
    typeof pConfig === 'object' ? JSON.parse(JSON.stringify(pConfig)) : pConfig;
  // If `source` is null/undefined, we simply return it
  // so that it can override an existing value in `target`.
  if (packageConfig === null || packageConfig === undefined) {
    return originalConfig;
  }

  // If `source` is not an object (e.g., number, string, etc.),
  // just override whatever is in `target`.
  if (typeof packageConfig !== 'object') {
    return packageConfig;
  }

  // If `source` is an array, we override target's value completely
  // with the new array.
  if (Array.isArray(packageConfig)) {
    return packageConfig.slice(); // return a copy if you want immutability
  }

  // If we're here, `source` is a plain object.
  // If `target` isn't an object (or is an array), convert it to an empty object
  // so we can merge properties into it.
  if (
    typeof originalConfig !== 'object' ||
    originalConfig === null ||
    Array.isArray(originalConfig)
  ) {
    originalConfig = {};
  }

  // Merge every key in `source` into `target`
  for (const [key, value] of Object.entries(packageConfig)) {
    originalConfig[key] = deepMerge(originalConfig[key], value);
  }

  return originalConfig;
}

// @todo Add js docs to below function
const getValidPackages = async () => {
  const validPackages = [];
  for (const workspace of workspaces) {
    // Pattern to match files
    const paths = await glob(workspace, {
      cwd: rootDir,
    });
    for (const path of paths) {
      try {
        const pathFiles = await readdir(path);
        if (
          pathFiles.includes('package.json') &&
          pathFiles.includes('wrangler.config.json')
        ) {
          validPackages.push(path);
        }
      } catch {
        // do nothing
      }
    }
  }
  return validPackages;
};

const setupWranglerInPackage = async (packageDir) => {
  try {
    const packageWranglerConfigPath = resolve(
      rootDir,
      packageDir,
      'wrangler.config.json',
    );
    const outputWranglerConfigPath = resolve(
      rootDir,
      packageDir,
      'wrangler.json',
    );
    const rootDevVars = resolve(rootDir, '.dev.vars');
    const rootDevVarsContent = await readFile(rootDevVars, 'utf8');
    const outputDevVarsPath = resolve(rootDir, packageDir, '.dev.vars');

    const packageWranglerConfig = (
      await import(pathToFileURL(packageWranglerConfigPath), {
        assert: {
          type: 'json',
        },
        with: {
          type: 'json',
        },
      })
    ).default;
    const packageWrangler = deepMerge(
      rootWranglerConfig,
      packageWranglerConfig,
    );
    await writeFile(
      outputWranglerConfigPath,
      JSON.stringify(packageWrangler, null, 2),
    );
    await writeFile(outputDevVarsPath, rootDevVarsContent);
  } catch (error) {
    console.error(error);
  }
};

// Add a path validation function
const isValidPath = (path) => {
  if (!path) return false;
  // Check if path contains any shell special characters
  if (/[;&|`$()\\]/.test(path)) return false;
  // Ensure path is within the project directory
  const normalizedPath = resolve(path);
  return normalizedPath.startsWith(rootDir);
};

// Path to wrangler - using join for more consistent path handling
const wranglerPath = join(rootDir, 'node_modules', '.bin', 'wrangler');

export const init = async () => {
  const packages = await getValidPackages();

  // Validate wrangler path
  if (!isValidPath(wranglerPath)) {
    throw new Error('Invalid wrangler path detected');
  }

  for (const packageDir of packages) {
    // Validate package directory
    if (!isValidPath(packageDir)) {
      console.error(`Skipping invalid package directory: ${packageDir}`);
      continue;
    }

    await setupWranglerInPackage(packageDir);
    await new Promise((presolve, reject) => {
      // Use an array of arguments instead of template string
      const cmd = wranglerPath;
      const args = ['types'];

      const childProcess = exec(
        `"${cmd}" ${args.join(' ')}`,
        {
          cwd: packageDir,
          shell: '/bin/sh', // Explicitly specify shell
        },
        (error, _, stderr) => {
          if (error) {
            console.error(`Error: ${packageDir}: ${error.message}`);
            reject(error);
            return;
          }
          if (stderr) {
            console.error(`Stderr: ${packageDir}: ${stderr}`);
          }
          presolve();
        },
      );

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        childProcess.kill();
        reject(new Error('Command execution timed out'));
      }, 30000); // 30 second timeout

      childProcess.on('close', () => clearTimeout(timeout));
    });
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  // Code to execute when the script is run directly
  init();
}
