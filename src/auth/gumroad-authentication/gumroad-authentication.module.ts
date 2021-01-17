import { HttpModule, Module } from '@nestjs/common'
import { GumroadAuthenticationController } from './gumroad-authentication.controller'
import { GumroadAuthenticationService } from './gumroad-authentication.service';

@Module({
  imports: [HttpModule],
  controllers: [GumroadAuthenticationController],
  providers: [GumroadAuthenticationService],
})
export class GumroadAuthenticationModule {}
