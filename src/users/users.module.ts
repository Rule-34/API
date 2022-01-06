import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
