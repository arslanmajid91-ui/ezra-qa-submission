import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import playwrightPlugin from 'eslint-plugin-playwright'

export default [
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', 'tests/diagnostic/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json' },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      playwright: playwrightPlugin,
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // Playwright
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/no-force-option': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/valid-expect': 'error',

      // General
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]
