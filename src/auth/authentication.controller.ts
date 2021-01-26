import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { GumroadBodyDTO } from '../users/dto/gumroad-body.dto'
import { AuthenticationService } from './authentication.service'
import { JwtAuthenticationGuard } from './guards/jwt-authentication.guard'

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body()
    body: GumroadBodyDTO
  ) {
    const { license_key } = body

    const data = await this.authenticationService.findLicense(license_key)

    return data
  }
}
