import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserData } from '../../users/interfaces/users.interface'
import { InvalidSubscriptionException } from '../../users/exceptions/invalid-subscription.exception'

@Injectable()
export class JwtAuthenticationStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    })
  }

  validate(request: Request, payload: UserData) {
    if (!payload.is_subscription_valid) {
      throw new InvalidSubscriptionException()
    }

    // This adds the payload to req.user
    return payload
  }
}
