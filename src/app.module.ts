import { Module } from '@nestjs/common'
import { BooruModule } from './booru/booru.module'
import { AuthModule } from './auth/auth.module'
import { AppController } from './app.controller'

@Module({
  imports: [BooruModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}
