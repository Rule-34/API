module.exports = {
  root: true,

  env: {
    node: true,
    jest: true
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    sourceType: 'module'
  },

  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],

  plugins: ['@typescript-eslint/eslint-plugin'],

  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
}
