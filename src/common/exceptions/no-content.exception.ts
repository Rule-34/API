import { HttpException, HttpStatus } from '@nestjs/common'

export class NoContentException extends HttpException {
  constructor(description = 'No content') {
    super(
      HttpException.createBody(description, undefined, HttpStatus.NOT_FOUND),
      HttpStatus.NOT_FOUND
    )
  }
}
