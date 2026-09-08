import type { ArgumentsHost } from '@nestjs/common'
import { Catch, HttpException, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core'
import * as Sentry from '@sentry/nestjs'

const UPSTREAM_OUTAGE_STATUSES: readonly number[] = [
  HttpStatus.BAD_GATEWAY as number,
  HttpStatus.SERVICE_UNAVAILABLE as number,
  HttpStatus.GATEWAY_TIMEOUT as number
]

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

      // 4xx client errors are expected request rejections, not server defects
      if (status < 500) {
        return false
      }

      // 502/503/504 upstream provider failures are external outages, not application bugs
      if (UPSTREAM_OUTAGE_STATUSES.includes(status)) {
        return false
      }
    }

    return true
  }
}
