module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    parser: 'babel-eslint',
    "ecmaVersion": 9,
    sourceType: "module"
  },
  extends: [
    "eslint:recommended",
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off"
  },
}
