/** @type {import('eslint').Linter.Config[]} */
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        Headers: 'readonly',
        Response: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        setInterval: 'readonly',
        Promise: 'readonly',
        Map: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'warn',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-trailing-spaces': 'warn',
      'semi': ['error', 'always'],
      'no-throw-literal': 'error',
      'no-return-await': 'warn',
      'n/no-deprecated-api': 'off',
      'n/prefer-global/process': 'off',
      'n/no-missing-require': 'off',
    },
  },
  {
    files: ['src/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: { 'no-console': 'off' },
  },
];
