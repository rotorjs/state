import js from '@eslint/js';
import * as tsParser from '@typescript-eslint/parser';
import { importX } from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import globals from 'globals';
import { configs as tseslintConfigs } from 'typescript-eslint';

export default [
  // globalIgnores(['dist']),
  js.configs.recommended,
  tseslintConfigs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite(),
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { enableAutofixRemoval: { imports: true } },
      ],
    },
  },
];
