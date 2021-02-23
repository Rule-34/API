import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { UserData } from 'src/users/interfaces/users.interface'
import { AuthenticationService } from './authentication.service'
import { LocalGuard } from './guards/local.guard'
import { JwtGuard } from './guards/jwt.guard'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { RequestWithUserData } from './interfaces/requestWithUserData.interface'

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('log-in')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  async login(
    @Request()
    req
  ) {
    // Set by LocalAuthenticationGuard on a successful validation
    // by this.authenticationService.loginWithLicense
    const userData: UserData = req.user

    const token = this.authenticationService.signToken(userData)
    const refreshToken = this.authenticationService.signRefreshToken(userData)

    return { ...token, ...refreshToken }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Request()
    req
  ) {
    // Got from the JWT
    const userData: RequestWithUserData = req.user

    const token = this.authenticationService.signToken(userData.data)

    return token
  }

  @Get('profile')
  @UseGuards(JwtGuard)
  profile(
    @Request()
    req
  ) {
    // Got from the JWT
    const userData: RequestWithUserData = req.user

    return userData.data
  }
}
