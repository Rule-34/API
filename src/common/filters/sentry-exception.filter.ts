import { ArgumentsHost, Catch, HttpException } from '@nestjs/common'
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core'
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
    return !(exception instanceof HttpException && exception.getStatus() < 500)
  }
}
