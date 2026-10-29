import { config } from '@repo/eslint-config/react-internal';
import { globalIgnores } from 'eslint/config';

/** @type {import("eslint").Linter.Config[]} */
export default [...config, globalIgnores(['.output/**', '.wxt/**'])];
