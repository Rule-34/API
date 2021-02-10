import {
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
import { AuthenticationService } from './authentication.service'
import { JwtBooruAuthenticationGuard } from './guards/jwt.guard'
import { LocalAuthenticationGuard } from './guards/local.guard'

@Controller()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthenticationGuard)
  async login(
    @Request()
    req
  ) {
    // Set by LocalAuthenticationGuard on a successful validation
    const userData: UserData = req.user

    const jsonWebToken = this.authenticationService.encodeJsonWebToken(userData)

    return jsonWebToken
  }

  @Get('auth/profile')
  @UseGuards(JwtBooruAuthenticationGuard)
  profile(
    @Request()
    req
  ) {
    const userData: UserData = req.user

    if (!userData) {
      throw new UnauthorizedException()
    }

    return userData
  }
}
