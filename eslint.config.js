import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-duplicate-imports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Preserve side-effect import order, especially Bootstrap before local CSS.
            ['^\\u0000'],
            ['^react(?:-dom)?(?:/|$)'],
            ['^node:'],
            ['^@?\\w'],
            ['^\\.\\.(?:/|$)'],
            ['^\\./'],
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['*.config.js', 'src/test/**/*.{js,jsx}', 'src/**/*.test.{js,jsx}'],
    languageOptions: { globals: globals.node },
  },
  prettier,
  {
    files: ['**/*.{js,jsx}'],
    // "all" is compatible with Prettier; the multiline alternatives are not.
    rules: { curly: ['error', 'all'] },
  },
]);
