import { Request, Response } from 'express'

module.exports = (req: Request, res: Response): void => {
  throw new Error('Test error')
}
