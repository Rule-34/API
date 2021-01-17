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

  // app.setGlobalPrefix('v1')

  app.register(helmet)

  app.enableCors({ origin: /r34\.app$/ })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform to DTO type
      // transformOptions: { enableImplicitConversion: true },

      whitelist: true, // Remove unnecessary properties
      forbidNonWhitelisted: true, // Sends "property <property> should not exist." error
    })
  )

  await app.listen(3000)
}
bootstrap()
