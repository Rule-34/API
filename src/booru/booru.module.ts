import { Module } from '@nestjs/common'
import { BooruService } from './booru.service'
import { BooruController } from './booru.controller'

@Module({
  providers: [BooruService],
  controllers: [BooruController]
})
export class BooruModule {}
