import { UnauthorizedException } from '@nestjs/common'

export class InvalidSubscriptionException extends UnauthorizedException {
  constructor(description = 'Subscription is no longer valid') {
    super(undefined, description)
  }
}
