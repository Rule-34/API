import type { ArgumentsHost } from '@nestjs/common'
import { Catch, HttpException, HttpStatus } from '@nestjs/common'
import type { HttpAdapterHost } from '@nestjs/core'
import { BaseExceptionFilter } from '@nestjs/core'
import * as Sentry from '@sentry/nestjs'

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  constructor(httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost.httpAdapter)
  }

  override catch(exception: unknown, host: ArgumentsHost): void {
    if (this.shouldCapture(exception)) {
      Sentry.captureException(exception, {
        mechanism: {
          handled: false,
          type: 'auto.http.nestjs.global_filter'
        }
      })
    }

    super.catch(exception, host)
  }

  private shouldCapture(exception: unknown): boolean {
    if (exception instanceof HttpException) {
      const status = exception.getStatus()

      // Ignore 4xx client errors
      if (status < 500) {
        return false
      }

      // Ignore upstream external gateway / booru service outages (502, 503, 504)
      if (
        status === Number(HttpStatus.BAD_GATEWAY) ||
        status === Number(HttpStatus.SERVICE_UNAVAILABLE) ||
        status === Number(HttpStatus.GATEWAY_TIMEOUT)
      ) {
        return false
      }
    }

    return true
  }
}
