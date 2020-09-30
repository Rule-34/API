import { Request, Response, NextFunction } from 'express'
import { query, validationResult, ValidationChain } from 'express-validator'

import { GenericAPIError } from '../util/error'

// #region Validation Chains

export const postsValidation = (): ValidationChain[] => [
  query('limit').isInt().optional(),
  query('pid').isInt().optional(),
  query('tags').isString().optional(),
  query('rating').isString().optional(),
  query('score').isString().optional(),
  query('order').isString().optional(),
  query('config').isString().optional(),
]

export const singlePostValidation = (): ValidationChain[] => [
  query('id').isInt().notEmpty(),
  query('config').isString().optional(),
]

export const tagsValidation = (): ValidationChain[] => [
  query('tag').isString().notEmpty(),
  query('limit').isInt().optional(),
  query('order').isString().optional(),
  query('pid').isInt().optional(),
  query('config').isString().optional(),
]

//#endregion

export const queryValidate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const extractedErrors = errors
      .array()
      .map(({ msg, param }) => `${msg} on param ${param}`)

    next(new GenericAPIError('Query errors', extractedErrors, 422))
    return
  }

  next()
}
