/**
 * .eslint.js
 *
 * ESLint configuration file.
 */
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.js'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  eslintConfigPrettier,

  // JavaScript linting rules
  {
    rules: {
      quotes: ['warn', 'single', { avoidEscape: true }],
      'no-trailing-spaces': ['warn', { skipBlankLines: false }],
      indent: 'off',
      'no-tabs': ['error'],
      semi: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'max-len': 'off',
      'object-curly-newline': [
        'error',
        {
          ObjectExpression: { multiline: true, minProperties: 3 },
          ObjectPattern: { multiline: true, minProperties: 3 },
          ImportDeclaration: 'never',
          ExportDeclaration: { multiline: true, minProperties: 3 },
        },
      ],
      'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
    },
  },
];
