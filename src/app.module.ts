import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BooruModule } from './booru/booru.module'
import { AuthModule } from './auth/auth.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    BooruModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
