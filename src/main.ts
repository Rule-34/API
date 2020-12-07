import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import helmet from 'fastify-helmet'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )

  app.register(helmet)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform to DTO type
      whitelist: true, // Remove unnecessary properties
      forbidNonWhitelisted: true,
    })
  )

  await app.listen(3000)
}
bootstrap()
