import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import base from './base.js';

/*
 * For internal (bundled by their consumer) libraries that utilize React.
 */
export default [
  ...base,
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.browser,
    },
  },
];
