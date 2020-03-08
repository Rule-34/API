const express = require('express'),
  router = express.Router(),
  { check, validationResult } = require('express-validator')

/* GET posts. */
router.get('/', [check('id').isInt()], async function(req, res) {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  return res
    .status(410)
    .json({ Error: "This site doesn't allow to search for single posts" })
})

module.exports = router
