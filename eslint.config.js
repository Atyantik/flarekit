import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export const defaultRootConfig = [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/public/**',
      '**/.astro/**',
      '**/.wrangler/**',
      '.turbo',
      '.cache',
      '**/*.d.ts',
    ],
  },
];

export { eslintConfigPrettier };

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...defaultRootConfig,
  // Always keep eslintConfigPrettier last to disable conflicting rules
  eslintConfigPrettier,
];
