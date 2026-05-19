import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  MethodNotAllowedException,
  NestInterceptor,
  ServiceUnavailableException,
  UnauthorizedException
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { EmptyDataError, EndpointError, HttpError } from '@alejandroakbal/universal-booru-wrapper'
import { NoContentException } from '../../common/exceptions/no-content.exception'
import { BooruAuthManagerService } from '../services/booru-auth-manager.service'
import { AuthFailureEvent } from '../interfaces/auth-manager.interface'
import { BOORU_CACHE_CONTROL_POLICIES } from '../constants/cache-control-policies'
import { SENSITIVE_AUTH_PARAMS } from '../constants/sensitive-auth-params'
import { ManagedCredentialPoolUnavailableError } from '../booru.service'
import type { BooruHttpRequest } from '../interfaces/booru-http.interface'

interface HeaderResponse {
  header(name: string, value: string): void
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.toString()
  }

  return String(error)
}

@Injectable()
export class BooruErrorsInterceptor implements NestInterceptor {
  constructor(private readonly authManager: BooruAuthManagerService) {}

  // Common booru authentication parameters that should be redacted from error messages
  private readonly sensitiveParams = SENSITIVE_AUTH_PARAMS

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        const response = context.switchToHttp().getResponse<HeaderResponse | undefined>()
        if (response && typeof response.header === 'function') {
          response.header('Cache-Control', BOORU_CACHE_CONTROL_POLICIES.ERROR)
        }

        // Check for authentication failures before processing other errors
        this.checkForAuthFailure(error, context)

        // Sanitize error messages to remove authentication data
        const sanitizedMessage = this.sanitizeErrorMessage(getErrorMessage(error))

        if (error instanceof ManagedCredentialPoolUnavailableError) {
          const retryAfterSeconds = this.getValidatedRetryAfterSeconds(error.retryAfterSeconds)

          if (retryAfterSeconds !== undefined) {
            response?.header('Retry-After', `${retryAfterSeconds}`)
          }

          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                  message: sanitizedMessage,
                  retryAfterSeconds,
                  reason: error.reason
                },
                HttpStatus.SERVICE_UNAVAILABLE
              )
          )
        }

        if (error instanceof EmptyDataError) {
          return throwError(() => new NoContentException(undefined, sanitizedMessage))
        }

        if (error instanceof EndpointError) {
          return throwError(() => new MethodNotAllowedException(undefined, sanitizedMessage))
        }

        if (error instanceof HttpError) {
          // Check if this is an auth-related HTTP error
          if (this.isCredentialFailure(error)) {
            return throwError(() => new UnauthorizedException(undefined, sanitizedMessage))
          }

          if (this.isRateLimitError(error)) {
            const retryAfterSeconds = this.getValidatedRetryAfterSeconds(this.getRetryAfterSeconds(error))
            if (retryAfterSeconds !== undefined) {
              response?.header('Retry-After', `${retryAfterSeconds}`)
            }

            return throwError(
              () =>
                new HttpException(
                  {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: sanitizedMessage,
                    retryAfterSeconds
                  },
                  HttpStatus.TOO_MANY_REQUESTS
                )
            )
          }

          return throwError(() => new ServiceUnavailableException(undefined, sanitizedMessage))
        }

        // For unknown errors, also sanitize the message
        const sanitizedError = new Error(sanitizedMessage)

        if (error instanceof Error) {
          sanitizedError.name = error.name

          if (error.stack !== undefined && error.stack !== '') {
            sanitizedError.stack = this.sanitizeErrorMessage(error.stack)
          }
        }

        return throwError(() => sanitizedError)
      })
    )
  }

  /**
   * Sanitizes error messages by removing sensitive authentication parameters from URLs
   */
  private sanitizeErrorMessage(message: string): string {
    if (!message) {
      return message
    }

    const urlPattern = /https?:\/\/[^\s]+/gi

    return message.replace(urlPattern, (url) => this.sanitizeUrl(url))
  }

  /**
   * Sanitizes a single URL by removing sensitive query parameters using native URL API
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)

      // Check each query parameter and redact sensitive ones
      for (const [key] of urlObj.searchParams.entries()) {
        if (this.sensitiveParams.some((param) => param.toLowerCase() === key.toLowerCase())) {
          urlObj.searchParams.set(key, 'REDACTED')
        }
      }

      return urlObj.toString()
    } catch {
      return this.sanitizeRawUrl(url)
    }
  }

  private sanitizeRawUrl(url: string): string {
    let sanitizedUrl = url

    for (const key of this.sensitiveParams) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const pattern = new RegExp(`([?&]${escapedKey}=)[^&#\\s]*`, 'gi')
      sanitizedUrl = sanitizedUrl.replace(pattern, '$1REDACTED')
    }

    return sanitizedUrl
  }

  private checkForAuthFailure(error: unknown, context: ExecutionContext): void {
    if (!this.isCredentialFailure(error) && !this.isRateLimitError(error)) {
      return
    }

    const request = context.switchToHttp().getRequest<BooruHttpRequest>()

    if (request.booruAuthContext?.source) {
      return
    }

    const contextCredential = request.booruAuthContext?.credential
    const baseEndpoint =
      request.booruAuthContext?.baseEndpoint ?? request.query?.baseEndpoint ?? request.body?.baseEndpoint
    const authUser = contextCredential?.user ?? request.query?.auth_user ?? request.body?.auth_user
    const authPass = contextCredential?.password ?? request.query?.auth_pass ?? request.body?.auth_pass

    if (baseEndpoint === undefined || baseEndpoint === '' || authUser === undefined || authUser === '') {
      return
    }

    const domain = this.extractDomainFromUrl(baseEndpoint)
    const authFailure: AuthFailureEvent = {
      domain,
      user: authUser,
      error: this.getAuthErrorMessage(error),
      timestamp: new Date()
    }

    if (authPass !== undefined) {
      authFailure.password = authPass
    }

    const failureKind = this.getFailureKind(error)
    if (failureKind !== undefined) {
      authFailure.failureKind = failureKind
    }

    const retryAfterSeconds = this.getRetryAfterSeconds(error)
    if (retryAfterSeconds !== undefined) {
      authFailure.retryAfterSeconds = retryAfterSeconds
    }

    this.authManager.reportAuthFailure(authFailure)
  }

  private isCredentialFailure(error: unknown): boolean {
    if (error instanceof HttpError) {
      const failureKind = error.failureKind
      const statusCode = error.statusCode

      if (failureKind === 'auth_invalid' || failureKind === 'auth_forbidden') {
        return true
      }

      if (statusCode === 401 || statusCode === 403) {
        return true
      }
    }

    const errorMessage = getErrorMessage(error).toLowerCase()
    const authErrorPatterns = [
      'unauthorized',
      'forbidden',
      'authentication failed',
      'invalid credentials',
      'access denied',
      'login required',
      'invalid api key',
      'invalid user',
      'authentication required'
    ]

    return authErrorPatterns.some((pattern) => errorMessage.includes(pattern))
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof HttpError) {
      const failureKind = error.failureKind
      const statusCode = error.statusCode

      if (failureKind === 'rate_limited') {
        return true
      }

      if (statusCode === 429) {
        return true
      }
    }

    const errorMessage = getErrorMessage(error).toLowerCase()
    return errorMessage.includes('status: 429') || errorMessage.includes('http 429')
  }

  private getAuthErrorMessage(error: unknown): string {
    if (error instanceof HttpError) {
      return `HTTP ${error.statusCode ?? 'unknown'}: ${error.message || 'Authentication error'}`
    }

    return getErrorMessage(error) || 'Unknown authentication error'
  }

  private getFailureKind(error: unknown): AuthFailureEvent['failureKind'] {
    if (error instanceof HttpError) {
      return error.failureKind
    }

    if (this.isRateLimitError(error)) {
      return 'rate_limited'
    }

    if (this.isCredentialFailure(error)) {
      return 'auth_forbidden'
    }

    return 'unknown'
  }

  private getRetryAfterSeconds(error: unknown): number | undefined {
    if (error instanceof HttpError && typeof error.retryAfterSeconds === 'number') {
      return error.retryAfterSeconds
    }

    return undefined
  }

  private getValidatedRetryAfterSeconds(value: unknown): number | undefined {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return undefined
    }

    if (value < 0) {
      return undefined
    }

    return Math.floor(value)
  }

  private extractDomainFromUrl(url: string): string {
    try {
      const hasProtocol = /^https?:\/\//i.test(url)
      const normalizedUrl = hasProtocol ? url : `https://${url}`
      const urlObj = new URL(normalizedUrl)
      return urlObj.hostname.toLowerCase()
    } catch {
      const [urlWithoutQuery = ''] = url.replace(/^(https?:\/\/)?/i, '').split(/[?#]/)
      const [domain = ''] = urlWithoutQuery.split('/')

      return domain.toLowerCase()
    }
  }
}
