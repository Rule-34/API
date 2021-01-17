import { Module } from '@nestjs/common'
import { GumroadAuthenticationModule } from './gumroad-authentication/gumroad-authentication.module'

@Module({
  imports: [GumroadAuthenticationModule],
})
export class AuthModule {}
