import js from '@eslint/js';
import turbo from 'eslint-config-turbo/flat';
import 'eslint-plugin-only-warn';

export default [
  { ignores: ['dist/'] },
  js.configs.recommended,
  ...turbo,
  {
    languageOptions: {
      globals: { React: true, JSX: true },
    },
  },
];
