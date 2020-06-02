import { Request, Response, NextFunction } from 'express'
import { query, validationResult, ValidationChain } from 'express-validator'

import { GenericAPIError } from '@/util/classes'

// Init
// import Debug from 'debug'
// const debug = Debug(`Server:middleware Query Validation`)

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
    query('score').isString().optional(),
    query('order').isString().optional(),
    query('config').isString().optional(),
  ]
}

export const singlePostValidation = (): ValidationChain[] => {
  return [query('id').isInt().notEmpty(), query('config').isString().optional()]
}

export const tagsValidation = (): ValidationChain[] => {
  return [
    query('tag').isString().notEmpty(),
    // Encode tags
    // .customSanitizer(encodeValue),
    query('limit').isInt().optional(),
    query('order').isString().optional(),
    query('pid').isInt().optional(),
    query('config').isString().optional(),
  ]
}

export const queryValidate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const extractedErrors = errors
      .array()
      .map((err) => `${err.msg} on param ${err.param}`)

    next(new GenericAPIError('Query errors', extractedErrors, 422))
    return
  }

  // Continue if theres no errors
  next()
  return
}
