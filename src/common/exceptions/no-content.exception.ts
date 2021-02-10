import { NotFoundException } from '@nestjs/common'

export class NoContentException extends NotFoundException {
  constructor(objectOrError?: any, description = 'No content.') {
    super(objectOrError, description)
  }
}
