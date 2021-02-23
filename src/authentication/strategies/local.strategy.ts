import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { AuthenticationService } from '../authentication.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthenticationService) {
    super()
  }

  async validate(username: string, password: string): Promise<any> {
    // We don't need to use `username` at all since it is a token
    const userData = await this.authService.loginWithLicense(password)

    return userData
  }
}
