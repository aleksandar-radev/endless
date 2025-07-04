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
      'no-trailing-spaces': ['error', { skipBlankLines: false }],
      indent: ['error', 2, { SwitchCase: 1 }],
      'no-tabs': ['error'],
      semi: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
];
