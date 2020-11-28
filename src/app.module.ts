import { Module } from '@nestjs/common';
import { BooruModule } from './booru/booru.module';

@Module({
  imports: [BooruModule],
})
export class AppModule {}
