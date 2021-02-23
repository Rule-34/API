import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { GumroadAPIRequest } from '../users/interfaces/gumroad.interface'
import { InvalidSubscriptionException } from '../users/exceptions/invalid-subscription.exception'

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,

    private readonly jwtService: JwtService
  ) {}

  async loginWithLicense(license: GumroadAPIRequest['license_key']) {
    const productPermalink = this.configService.get<string>(
      'GUMROAD_PRODUCT_PERMALINK'
    )

    const gumroadResponse = await this.usersService.verifyGumroadLicense(
      productPermalink,
      license
    )

    const userData = this.usersService.createUserDataFromGumroadResponse(
      gumroadResponse
    )

    // Validation
    if (!userData.is_subscription_valid) {
      throw new InvalidSubscriptionException()
    }

    return userData
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
    const signedData = this.jwtService.sign(data)
  signToken(data: string | object) {

    return { access_token: signedData }
  }

  // decodeJsonWebToken(token: string) {
  //   const decodedData = this.jwtService.verify(token)
  // eslint-disable-next-line @typescript-eslint/ban-types
  signRefreshToken(data: string | object) {
    const options: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    }

    const token = this.jwtService.sign({ data }, options)

  //   return decodedData
  // }
    return { refresh_token: token }
  }
}
