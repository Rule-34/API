import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '../users/users.service'
import { GumroadAPIRequest } from '../users/interfaces/gumroad.interface'

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  async findLicense(license: GumroadAPIRequest['license_key']) {
    const productPermalink = this.configService.get<string>(
      'GUMROAD_PRODUCT_PERMALINK'
    )

    const gumroadResponse = await this.usersService.verifyGumroadLicense(
      productPermalink,
      license
    )

    const extractedDetails = this.usersService.extractDetailsFromGumroadResponse(
      gumroadResponse
    )

    return extractedDetails
  }
}
