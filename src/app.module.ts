import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { BooruModule } from './booru/booru.module'
import { GumroadAuthenticationModule } from './gumroad-authentication/gumroad-authentication.module'

@Module({
  imports: [BooruModule, GumroadAuthenticationModule],
  controllers: [AppController],
})
export class AppModule {}
