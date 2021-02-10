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

  async findLicense(license: GumroadAPIRequest['license_key']) {
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

    if (!userData.is_subscription_valid) {
      throw new InvalidSubscriptionException()
    }

    return userData
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  encodeJsonWebToken(data: string | object) {
    const signedData = this.jwtService.sign(data)

    return { access_token: signedData }
  }

  // decodeJsonWebToken(token: string) {
  //   const decodedData = this.jwtService.verify(token)

  //   return decodedData
  // }
}
