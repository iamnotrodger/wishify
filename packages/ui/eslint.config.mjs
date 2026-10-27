import reactInternal from '@repo/eslint-config/react-internal';

export default [
  ...reactInternal,
  {
    rules: {
      'no-redeclare': 'off',
    },
  },
];
