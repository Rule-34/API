import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { AuthenticationService } from './authentication.service'
import { AuthenticationController } from './authentication.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { UsersModule } from '../users/users.module'
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy'

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
  controllers: [AuthenticationController]
})
export class AuthenticationModule {}
