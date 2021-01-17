import { Module } from '@nestjs/common'
import { GumroadAuthenticationController } from './gumroad-authentication.controller'

@Module({
  controllers: [GumroadAuthenticationController],
})
export class GumroadAuthenticationModule {}
