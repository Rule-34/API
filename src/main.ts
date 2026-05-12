import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import helmet from '@fastify/helmet'
import fastifyStatic from '@fastify/static'
import * as Sentry from '@sentry/node'
import { escapeRegExp } from 'lodash'
import { AppModule } from './app.module'
import { AppClusterService } from './cluster.service'
import { join } from 'path'
import { createAppValidationPipe } from './common/validation'

function buildAllowedOrigins(originConfig: string): RegExp[] {
  return originConfig
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pattern) => new RegExp('^' + escapeRegExp(pattern).replace(/\\\*/g, '.*') + '$'))
}

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

  const allowedOrigins = buildAllowedOrigins(configService.get<string>('ALLOWED_ORIGINS', ''))

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.some((pattern) => pattern.test(origin)))
    },
    credentials: true
  }

  app.enableCors(corsOptions)

  app.useGlobalPipes(createAppValidationPipe())

  await app.listen(configService.get<number>('PORT') ?? 3000, '0.0.0.0')
}

// bootstrap()
AppClusterService.clusterize(bootstrap)
