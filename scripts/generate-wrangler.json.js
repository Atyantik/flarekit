import rootWranglerConfig from '../wrangler.json' with { type: 'json' };
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';

const packageDir = process.cwd();
const packageWranglerConfigPath = resolve(packageDir, 'wrangler.config.json');
const outputWranglerConfigPath = resolve(packageDir, 'wrangler.json');

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
  } catch (error) {
    console.error(error);
  }
})();
