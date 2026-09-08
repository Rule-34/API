import type { ArgumentsHost } from '@nestjs/common'
import {
  BadGatewayException,
  GatewayTimeoutException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException
} from '@nestjs/common'
import type { HttpAdapterHost } from '@nestjs/core'
import * as Sentry from '@sentry/nestjs'
import { SentryExceptionFilter } from './sentry-exception.filter'

jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn()
}))

describe('SentryExceptionFilter', () => {
  let filter: SentryExceptionFilter
  let mockHttpAdapterHost: HttpAdapterHost
  let mockArgumentsHost: ArgumentsHost

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpAdapterHost = {
      httpAdapter: {
        reply: jest.fn(),
        end: jest.fn(),
        isHeadersSent: jest.fn().mockReturnValue(false),
        setHeader: jest.fn(),
        getRequestMethod: jest.fn().mockReturnValue('GET'),
        getRequestUrl: jest.fn().mockReturnValue('/test')
      }
    } as unknown as HttpAdapterHost

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
        getResponse: jest.fn().mockReturnValue({})
      }),
      getArgByIndex: jest.fn().mockReturnValue({}),
      getArgs: jest.fn().mockReturnValue([{}, {}]),
      getType: jest.fn().mockReturnValue('http')
    } as unknown as ArgumentsHost

    filter = new SentryExceptionFilter(mockHttpAdapterHost)
  })

  it('captures unhandled 500 InternalServerErrorException to Sentry', () => {
    const error = new InternalServerErrorException('Database failure')

    filter.catch(error, mockArgumentsHost)

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      mechanism: {
        handled: false,
        type: 'auto.http.nestjs.global_filter'
      }
    })
  })

  it('captures raw unhandled Error instances to Sentry', () => {
    const error = new Error('Unexpected runtime crash')

    filter.catch(error, mockArgumentsHost)

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      mechanism: {
        handled: false,
        type: 'auto.http.nestjs.global_filter'
      }
    })
  })

  it('ignores 4xx client errors (e.g. 404 NotFoundException)', () => {
    const error = new NotFoundException('Resource not found')

    filter.catch(error, mockArgumentsHost)

    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('ignores upstream 502 BadGatewayException', () => {
    const error = new BadGatewayException('Upstream booru returned 502')

    filter.catch(error, mockArgumentsHost)

    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('ignores upstream 503 ServiceUnavailableException', () => {
    const error = new ServiceUnavailableException('Upstream booru is unavailable')

    filter.catch(error, mockArgumentsHost)

    expect(Sentry.captureException).not.toHaveBeenCalled()
  })

  it('ignores upstream 504 GatewayTimeoutException', () => {
    const error = new GatewayTimeoutException('Upstream booru timed out')

    filter.catch(error, mockArgumentsHost)

    expect(Sentry.captureException).not.toHaveBeenCalled()
  })
})
