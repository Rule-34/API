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
import { LocalGuard } from './guards/local.guard'
import { JwtGuard } from './guards/jwt.guard'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'

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
    const userData: UserData = req.user

    const jsonWebToken = this.authenticationService.encodeJsonWebToken(userData)

    return jsonWebToken
  }

  @UseGuards(JwtBooruAuthenticationGuard)
  profile(
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Request()
    req
  ) {
    const userData: UserData = req.user
    // Got from the JWT
    const userData: RequestWithUserData = req.user

    const token = this.authenticationService.signToken(userData.data)

    return token
  }

    if (!userData) {
      throw new UnauthorizedException()
    }
  @Get('profile')

    return userData
  }
}
