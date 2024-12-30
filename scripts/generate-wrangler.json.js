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

await (async () => {
  try {
    const packageWranglerConfig = (
      await import(packageWranglerConfigPath, {
        with: {
          type: 'json',
        },
      })
    ).default;
    const packageWrangler = {
      ...rootWranglerConfig,
      ...packageWranglerConfig,
    };
    await writeFile(
      outputWranglerConfigPath,
      JSON.stringify(packageWrangler, null, 2),
    );
    await writeFile(outputDevVarsPath, rootDevVarsContent);
  } catch (error) {
    console.error(error);
  }
})();
