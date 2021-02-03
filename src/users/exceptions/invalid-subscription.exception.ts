import { UnauthorizedException } from '@nestjs/common'

export class InvalidSubscriptionException extends UnauthorizedException {
  constructor(
    objectOrError?: any,
    description = 'Subscription is no longer valid.'
  ) {
    super(objectOrError, description)
  }
}
