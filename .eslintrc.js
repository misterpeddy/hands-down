module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  plugins: ['prettier', 'eslint-plugin-html'],
  extends: ['airbnb-base', 'prettier', 'esnext'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'import/no-named-as-default-member': 'off',
    'prettier/prettier': ['error', { singleQuote: true }],
  },
};
