import './instrument'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import helmet from '@fastify/helmet'
import fastifyStatic from '@fastify/static'
import { AppModule } from './app.module'
import { AppClusterService } from './cluster.service'
import { join } from 'path'
import { createAppValidationPipe } from './common/validation'

type FastifyCorsOptions = Parameters<NestFastifyApplication['enableCors']>[0]

function buildAllowedOrigins(originConfig: string): RegExp[] {
  return originConfig
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pattern) => new RegExp('^https?://' + RegExp.escape(pattern).replace(/\\\*/g, '.*') + '$'))
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  const configService: ConfigService = app.get(ConfigService)

  await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'public')
  })

  await app.register(helmet)

  const allowedOrigins = buildAllowedOrigins(configService.get<string>('ALLOWED_ORIGINS', ''))

  const corsOptions: FastifyCorsOptions = {
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
