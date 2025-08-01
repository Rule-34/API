import { Module } from '@nestjs/common'
import { BooruService } from './booru.service'
import { BooruController } from './booru.controller'
import { BooruAuthManagerService } from './services/booru-auth-manager.service'

@Module({
  providers: [BooruService, BooruAuthManagerService],
  controllers: [BooruController]
})
export class BooruModule {}
