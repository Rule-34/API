const { validationResult } = require('express-validator')
//   debug = require('debug')(`Posts Template`)

const queryValidate = (req, res, next) => {
  const errors = validationResult(req)

  // Check if there is any error
  if (!errors.isEmpty()) {
    // Create array of errors
    const extractedErrors = []
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }))

    // Send array of errors
    return res.status(422).json({
      errors: extractedErrors
    })
  }

  // Continue if theres no errors
  return next()
}

module.exports = {
  queryValidate
}
