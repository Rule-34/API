import { Module } from '@nestjs/common';
import { BooruModule } from './booru/booru.module';
import { GumroadAuthenticationModule } from './gumroad-authentication/gumroad-authentication.module';

@Module({
  imports: [BooruModule, GumroadAuthenticationModule],
})
export class AppModule {}
