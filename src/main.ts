import { ValidationPipe } from '@nestjs/common'
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import helmet from '@fastify/helmet'
import fastifyStatic from '@fastify/static'
import * as Sentry from '@sentry/node'
import { AppModule } from './app.module'
import { escapeRegExp } from 'lodash'
import { AppClusterService } from './cluster.service'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  const configService: ConfigService = app.get(ConfigService)

  await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'public')
  })

  // Sentry
  Sentry.init({
    enabled: configService.get<boolean>('SENTRY_ENABLED') || false,
    dsn: configService.get<string>('SENTRY_DSN')

    // ignoreErrors: ['NoContentException', 'MethodNotAllowedException'],
  })

  await app.register(helmet)

  const allowedOrigin = configService.get<string>('ALLOWED_ORIGIN')
  const allowedOriginRegex = new RegExp(escapeRegExp(allowedOrigin) + '$')

  const corsOptions: CorsOptions = {
    origin: configService.get<string>('NODE_ENV') === 'development' ? '*' : allowedOriginRegex,
    credentials: true
  }

  app.enableCors(corsOptions)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform to DTO type
      // transformOptions: { enableImplicitConversion: true },

      whitelist: true, // Remove unnecessary properties
      forbidNonWhitelisted: true // Sends "property <property> should not exist." error
    })
  )

  await app.listen(configService.get<number>('PORT'), '0.0.0.0')
}

// bootstrap()
AppClusterService.clusterize(bootstrap)
