import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BooruModule } from './booru/booru.module'
import { AuthenticationModule } from './auth/authentication.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    BooruModule,
    AuthenticationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
