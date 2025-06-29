import {
  CallHandler,
  ExecutionContext,
  Injectable,
  MethodNotAllowedException,
  NestInterceptor,
  ServiceUnavailableException
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { EmptyDataError, EndpointError, HttpError } from '@alejandroakbal/universal-booru-wrapper'
import { NoContentException } from '../../common/exceptions/no-content.exception'

@Injectable()
export class BooruErrorsInterceptor implements NestInterceptor {
  
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
            return throwError(() => new ServiceUnavailableException(undefined, sanitizedMessage))

          default:
            // For unknown errors, also sanitize the message
            const sanitizedError = new Error(sanitizedMessage)

            sanitizedError.name = error.name

            if (error.stack) {
              sanitizedError.stack = this.sanitizeErrorMessage(error.stack)
            }

            return throwError(() => sanitizedError)
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
    const urlObj = new URL(url)

    // Check each query parameter and redact sensitive ones
    for (const [key, value] of urlObj.searchParams.entries()) {
      if (this.sensitiveParams.some((param) => param.toLowerCase() === key.toLowerCase())) {
        urlObj.searchParams.set(key, 'REDACTED')
      }
    }

    return urlObj.toString()
  }
}
