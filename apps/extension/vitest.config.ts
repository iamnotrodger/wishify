import { uiConfig } from '@repo/vitest-config/ui';
import { defineProject, mergeConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default mergeConfig(uiConfig, defineProject({ plugins: [WxtVitest()] }));
