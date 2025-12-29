/**
 * .eslint.js
 *
 * ESLint configuration file.
 */

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.js'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  // JavaScript linting rules
  {
    rules: {
      quotes: ['warn', 'single', { avoidEscape: true }],
      'no-trailing-spaces': ['warn', { skipBlankLines: false }],
      indent: ['error', 2],
      'no-tabs': ['error'],
      semi: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'max-len': 'off',
      'arrow-parens': ['error', 'always'],
      'linebreak-style': ['error', 'unix'],
      'quote-props': ['error', 'as-needed'],
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
