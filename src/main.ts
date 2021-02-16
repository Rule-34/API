import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import helmet from 'fastify-helmet'
import * as Sentry from '@sentry/node'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )

  const configService: ConfigService = app.get(ConfigService)

  // Sentry
  Sentry.init({
    enabled: configService.get<boolean>('SENTRY_ENABLED') || false,
    dsn: configService.get<string>('SENTRY_DSN') || '',
  })

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

  await app.listen(configService.get<string>('PORT'))
}

bootstrap()
