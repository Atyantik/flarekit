import rootWranglerConfig from '../wrangler.json' with { type: 'json' };
import { dirname, resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';

const rootDir = resolve(dirname(new URL(import.meta.url).pathname), '..');

const packageDir = process.cwd();
const packageWranglerConfigPath = resolve(packageDir, 'wrangler.config.json');
const outputWranglerConfigPath = resolve(packageDir, 'wrangler.json');
const rootDevVars = resolve(rootDir, '.dev.vars');
const rootDevVarsContent = await readFile(rootDevVars, 'utf8');
const outputDevVarsPath = resolve(packageDir, '.dev.vars');

/**
 * This function is a deep merge function that merges two objects
 * @param object originalConfig
 * @param object packageConfig
 * @returns
 */
function deepMerge(originalConfig, packageConfig) {
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

await (async () => {
  try {
    const packageWranglerConfig = (
      await import(packageWranglerConfigPath, {
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
})();
