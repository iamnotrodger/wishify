import { baseConfig } from '@repo/vitest-config/base';
import { defineProject, mergeConfig } from 'vitest/config';

export default mergeConfig(
  baseConfig,
  defineProject({
    resolve: {
      alias: { '@': import.meta.dirname },
    },
  })
);
