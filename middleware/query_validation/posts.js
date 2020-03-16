const { query } = require('express-validator')
//   debug = require('debug')(`Posts Template`)

const postsValidation = () => {
  return [
    query('limit')
      .isInt()
      .optional(),
    query('pid')
      .isInt()
      .optional(),
    query('tags')
      .isString()
      .optional(),
    query('rating')
      .isString()
      .optional(),
    query('score')
      .isInt()
      .optional(),
    query('corsProxy')
      .isBoolean()
      .toBoolean()
      .optional()
  ]
}

module.exports = {
  postsValidation
}
