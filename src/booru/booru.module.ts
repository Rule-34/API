import { Module } from '@nestjs/common'
import { BooruService } from './booru.service'
import { BooruController } from './booru.controller'
import { BooruCacheControlInterceptor } from './interceptors/booru-cache-control.interceptor'
import { BooruErrorsInterceptor } from './interceptors/booru-exception.interceptor'
import { BooruAuthManagerService } from './services/booru-auth-manager.service'

@Module({
  providers: [BooruService, BooruAuthManagerService, BooruCacheControlInterceptor, BooruErrorsInterceptor],
  controllers: [BooruController],
  exports: [BooruAuthManagerService]
})
export class BooruModule {}
