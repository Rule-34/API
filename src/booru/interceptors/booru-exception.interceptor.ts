import {
  CallHandler,
  ExecutionContext,
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

@Injectable()
export class BooruErrorsInterceptor implements NestInterceptor {
  constructor(private readonly authManager: BooruAuthManagerService) {}

  // Common booru authentication parameters that should be redacted from error messages
  private readonly sensitiveParams = [
    'user_id',
    'api_key',
    'password',
    'password_hash',
    'pass_hash',
    'auth_user',
    'auth_pass',
    'token',
    'secret',
    'key',
    'access_token',
    'auth_token',
    'session_id',
    'session',
    'login',
    'username',
    'user',
    'hash'
  ]

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Check for authentication failures before processing other errors
        this.checkForAuthFailure(error, context)

        // Sanitize error messages to remove authentication data
        const originalMessage = error.message !== undefined ? error.message : error.toString()
        const sanitizedMessage = this.sanitizeErrorMessage(originalMessage)

        // Throw better errors with sanitized messages
        switch (error.constructor) {
          case EmptyDataError:
            return throwError(() => new NoContentException(undefined, sanitizedMessage))

          case EndpointError:
            return throwError(() => new MethodNotAllowedException(undefined, sanitizedMessage))

          case HttpError:
            // Check if this is an auth-related HTTP error
            if (this.isAuthError(error)) {
              return throwError(() => new UnauthorizedException(undefined, sanitizedMessage))
            }
            return throwError(() => new ServiceUnavailableException(undefined, sanitizedMessage))

          default: {
            // For unknown errors, also sanitize the message
            const sanitizedError = new Error(sanitizedMessage)

            sanitizedError.name = error.name

            if (error.stack) {
              sanitizedError.stack = this.sanitizeErrorMessage(error.stack)
            }

            return throwError(() => sanitizedError)
          }
        }
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

    const urlPattern = /https?:\/\/[^\s]+/g

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
    } catch (error) {
      return url
    }
  }

  private checkForAuthFailure(error: any, context: ExecutionContext): void {
    if (!this.isAuthError(error)) {
      return
    }

    const request = context.switchToHttp().getRequest()
    const baseEndpoint = request.query?.baseEndpoint || request.body?.baseEndpoint
    const authUser = request.query?.auth_user || request.body?.auth_user
    const authPass = request.query?.auth_pass || request.body?.auth_pass

    if (!baseEndpoint || !authUser) {
      return
    }

    const domain = this.extractDomainFromUrl(baseEndpoint)
    const authFailure: AuthFailureEvent = {
      domain,
      user: authUser,
      password: authPass,
      error: this.getAuthErrorMessage(error),
      timestamp: new Date()
    }

    this.authManager.reportAuthFailure(authFailure)
  }

  private isAuthError(error: any): boolean {
    if (error.constructor === HttpError) {
      const httpError = error as any
      const statusCode = httpError.statusCode || httpError.status

      if (statusCode === 401 || statusCode === 403) {
        return true
      }
    }

    const errorMessage = (error.message || error.toString()).toLowerCase()
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

  private getAuthErrorMessage(error: any): string {
    if (error.constructor === HttpError) {
      const httpError = error as any
      const statusCode = httpError.statusCode || httpError.status
      return `HTTP ${statusCode}: ${error.message || 'Authentication error'}`
    }

    return error.message || error.toString() || 'Unknown authentication error'
  }

  private extractDomainFromUrl(url: string): string {
    try {
      const hasProtocol = /^https?:\/\//i.test(url)
      const normalizedUrl = hasProtocol ? url : `https://${url}`
      const urlObj = new URL(normalizedUrl)
      return urlObj.hostname.toLowerCase()
    } catch (error) {
      return url
        .replace(/^(https?:\/\/)?/i, '')
        .split('/')[0]
        .toLowerCase()
    }
  }
}
