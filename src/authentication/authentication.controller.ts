import { Controller, Get, HttpCode, HttpStatus, Post, Request, Res, UseGuards } from '@nestjs/common'
import { UserData } from 'src/users/interfaces/users.interface'
import { AuthenticationService } from './authentication.service'
import { LocalGuard } from './guards/local.guard'
import { JwtGuard } from './guards/jwt.guard'
import { RequestWithUserData } from './interfaces/requestWithUserData.interface'

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('log-in')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  async login(
    @Request()
    req,
    @Res({ passthrough: true })
    res
  ) {
    // Set by LocalAuthenticationGuard on a successful validation
    // by this.authenticationService.loginWithLicense
    const userData: UserData = req.user

    const token = this.authenticationService.signToken(userData)

    res.setCookie('auth-cookie', token, {
      httpOnly: true
      // secure: 'auto',
      // sameSite: 'strict'
    })

    return { message: 'Logged in' }
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
