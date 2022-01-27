module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: ['app-bundled.js'],
  rules: {
    'no-use-before-define': [2, { functions: false }],
    'no-param-reassign': [2, { props: false }],
    'max-len': [2, { ignoreComments: true, code: 100 }],
  },
};
