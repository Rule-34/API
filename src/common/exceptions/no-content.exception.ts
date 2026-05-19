import { NotFoundException } from '@nestjs/common'

export class NoContentException extends NotFoundException {
  constructor(objectOrError?: unknown, description = 'No content.') {
    super(objectOrError, description)
  }
}
