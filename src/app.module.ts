import { APP_FILTER } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SentryModule } from '@sentry/nestjs/setup'
import { BooruModule } from './booru/booru.module'
import { AppController } from './app.controller'
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter'

@Module({
  imports: [SentryModule.forRoot(), ConfigModule.forRoot({ isGlobal: true, cache: true }), BooruModule],

  controllers: [AppController],

  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryExceptionFilter
    }
  ]
})
export class AppModule {}
