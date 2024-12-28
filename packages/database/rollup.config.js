import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts', // Entry point
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs', // CommonJS format
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm', // ES Module format
    },
  ],
  plugins: [
    // Resolves node_modules imports
    resolve(),
    // Converts CommonJS modules to ES6
    commonjs(),
    // Compiles TypeScript
    typescript(),
  ],
};
