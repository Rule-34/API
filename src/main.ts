import { ValidationPipe } from '@nestjs/common'
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
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
    dsn: configService.get<string>('SENTRY_DSN'),

    // ignoreErrors: ['NoContentException', 'MethodNotAllowedException'],
  })

  app.register(helmet)

  const corsOptions: CorsOptions = {
    origin:
      configService.get<string>('NODE_ENV') === 'development'
        ? '*'
        : /r34\.app$/,
  }

  app.enableCors(corsOptions)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform to DTO type
      // transformOptions: { enableImplicitConversion: true },

      whitelist: true, // Remove unnecessary properties
      forbidNonWhitelisted: true, // Sends "property <property> should not exist." error
    })
  )

  await app.listen(configService.get<number>('PORT'), '0.0.0.0')
}

bootstrap()
