module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  plugins: ['prettier', 'eslint-plugin-html', 'security', 'jquery'],
  extends: [
    'airbnb-base',
    'prettier',
    'esnext',
    'plugin:security/recommended',
    'plugin:you-dont-need-lodash-underscore/compatible',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'import/no-commonjs': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-nodejs-modules': 'off',
    'no-plusplus': 'off',
    'prettier/prettier': ['error', { singleQuote: true }],
  },
};
