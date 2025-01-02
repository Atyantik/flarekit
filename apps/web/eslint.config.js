import globals from "globals";
import eslintPluginAstro from "eslint-plugin-astro";
import astroParser from "astro-eslint-parser";
import tsParser from "@typescript-eslint/parser";
import {
  defaultRootConfig,
  eslintConfigPrettier,
} from "../../eslint.config.js";

export default [
  ...defaultRootConfig,
  {
    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
  },
  {
    files: ["**/*.astro"],
    plugins: {
      astro: eslintPluginAstro,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: astroParser,
      parserOptions: {
        parser: tsParser, // Use TypeScript parser for embedded scripts
        ecmaVersion: 2021,
        sourceType: "module",
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      ...eslintPluginAstro.configs.recommended.rules,
    },
  },
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  eslintConfigPrettier,
];
