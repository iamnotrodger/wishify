import { uiConfig } from '@repo/vitest-config/ui';
import { mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, uiConfig);
