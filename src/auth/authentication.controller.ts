import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { UserData } from 'src/users/interfaces/users.interface'
import { GumroadBodyDTO } from '../users/dto/gumroad-body.dto'
import { AuthenticationService } from './authentication.service'
import { JwtBooruAuthenticationGuard } from './guards/jwt-authentication.guard'

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

    const jsonWebToken = this.authenticationService.encodeJsonWebToken(data)

    // return data
    return jsonWebToken
  }

  @Get('auth/profile')
  @UseGuards(JwtBooruAuthenticationGuard)
  profile(@Request() req) {
    const userData = req.user as UserData

    if (!userData) {
      throw new UnauthorizedException()
    }

    return userData
  }
}
