import { APP_INTERCEPTOR } from '@nestjs/core'
import { HttpException, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RavenInterceptor, RavenModule } from 'nest-raven'
import { BooruModule } from './booru/booru.module'
import { AuthenticationModule } from './authentication/authentication.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    RavenModule,
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    BooruModule,
    AuthenticationModule,
  ],

  controllers: [AppController],

  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
      // useValue: new RavenInterceptor({
      //   filters: [
      //     // Filter exceptions of type HttpException. Ignore those that have status code of less than 500
      //     {
      //       type: HttpException,
      //       filter: (exception: HttpException) => 500 > exception.getStatus(),
      //     },
      //   ],
      // }),
    },
  ],
})
export class AppModule {}
