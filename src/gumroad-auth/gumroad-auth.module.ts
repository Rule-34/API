import { HttpModule, Module } from '@nestjs/common'
import { GumroadAuthController } from './gumroad-auth.controller'
import { GumroadAuthService } from './gumroad-auth.service'

@Module({
  imports: [HttpModule],
  controllers: [GumroadAuthController],
  providers: [GumroadAuthService],
})
export class GumroadAuthModule {}
