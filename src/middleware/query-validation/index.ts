import { Request, Response, NextFunction } from 'express'
import { query, validationResult, ValidationChain } from 'express-validator'

import { CustomError } from '@/util/classes'

// Init
import Debug from 'debug'
const debug = Debug(`Server:middleware Query Validation`)

/**
 * Helpers
 */

// function encodeValue(value: string): string {
//   // debug(`\n\n${value} -> ${encodeURIComponent(value)}\n\n`)
//   return encodeURIComponent(value)
// }

/**
 * Validators
 */
export const postsValidation = (): ValidationChain[] => {
  return [
    query('limit').isInt().optional(),
    query('pid').isInt().optional(),
    query('tags').isString().optional(),
    // // Encode tags
    // .customSanitizer(encodeValue),
    query('rating').isString().optional(),
    query('score').isInt().optional(),
    query('corsProxy').isBoolean().toBoolean().optional(),
  ]
}

export const singlePostValidation = (): ValidationChain[] => {
  return [
    query('id').isInt().notEmpty(),
    query('corsProxy').isBoolean().toBoolean().optional(),
  ]
}

export const tagsValidation = (): ValidationChain[] => {
  return [
    query('tag').isString().notEmpty(),
    // Encode tags
    // .customSanitizer(encodeValue),
    query('limit').isInt().optional(),
    query('order').isString().optional(),
    query('pid').isInt().optional(),
  ]
}

export const queryValidate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)

  // Check if there is any error
  if (!errors.isEmpty()) {
    // Create array of errors
    const extractedErrors: Array<object> = []
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }))

    next(
      new CustomError('Check the following query errors', 422, extractedErrors)
    )
    return
  }

  // Continue if theres no errors
  next()
  return
}
