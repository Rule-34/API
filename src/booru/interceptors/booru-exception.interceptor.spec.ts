import { Test, TestingModule } from '@nestjs/testing'
import { CallHandler, ExecutionContext } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { BooruErrorsInterceptor } from './booru-exception.interceptor'
import { EmptyDataError, EndpointError, HttpError } from '@alejandroakbal/universal-booru-wrapper'
import { NoContentException } from '../../common/exceptions/no-content.exception'

describe('BooruErrorsInterceptor', () => {
  let interceptor: BooruErrorsInterceptor
  let mockExecutionContext: ExecutionContext
  let mockCallHandler: CallHandler

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooruErrorsInterceptor]
    }).compile()

    interceptor = module.get<BooruErrorsInterceptor>(BooruErrorsInterceptor)
    mockExecutionContext = {} as ExecutionContext
    mockCallHandler = {
      handle: jest.fn()
    } as CallHandler
  })

  // Helper function to test URL sanitization
  const testUrlSanitization = (
    errorMessage: string,
    expectedRedactedParams: string[],
    forbiddenValues: string[],
    preservedParams: string[] = []
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const originalError = new Error(errorMessage)
      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => originalError))

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: (error) => {
          try {
            // Check that sensitive params are redacted
            expectedRedactedParams.forEach((param) => {
              expect(error.message).toContain(`${param}=REDACTED`)
            })

            // Check that forbidden values are not present
            forbiddenValues.forEach((value) => {
              expect(error.message).not.toContain(value)
            })

            // Check that preserved params remain unchanged
            preservedParams.forEach((param) => {
              expect(error.message).toContain(param)
            })

            resolve()
          } catch (err) {
            reject(err)
          }
        }
      })
    })
  }

  describe('Error Type Handling', () => {
    const errorTypeTests = [
      {
        name: 'EmptyDataError to NoContentException',
        errorClass: EmptyDataError,
        expectedClass: NoContentException,
        url: 'https://gelbooru.com/index.php?page=dapi&user_id=12345&api_key=secret123'
      },
      {
        name: 'HttpError to ServiceUnavailableException',
        errorClass: HttpError,
        expectedClass: Error, // ServiceUnavailableException extends Error
        url: 'https://gelbooru.com/index.php?user_id=98765&api_key=topsecret&tags=test'
      },
      {
        name: 'EndpointError to MethodNotAllowedException',
        errorClass: EndpointError,
        expectedClass: Error, // MethodNotAllowedException extends Error
        url: 'https://danbooru.donmai.us/posts.json?auth_user=testuser&auth_pass=password123'
      }
    ]

    errorTypeTests.forEach(({ name, errorClass, expectedClass, url }) => {
      it(`should convert ${name} with sanitized message`, async () => {
        const originalError = new errorClass(`Request failed for ${url}`)
        mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => originalError))

        return new Promise<void>((resolve, reject) => {
          interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            error: (error) => {
              try {
                expect(error).toBeInstanceOf(expectedClass)
                expect(error.message).toContain('=REDACTED')
                resolve()
              } catch (err) {
                reject(err)
              }
            }
          })
        })
      })
    })

    it('should sanitize unknown error types', async () => {
      await testUrlSanitization(
        'Custom error with URL: https://example.com/api?token=abc123&secret=xyz789',
        ['token', 'secret'],
        ['abc123', 'xyz789']
      )
    })
  })

  describe('URL Sanitization', () => {
    it('should sanitize multiple sensitive parameters in a single URL', async () => {
      await testUrlSanitization(
        'Failed: https://site.com/api?user_id=123&api_key=secret&password=password123&limit=10',
        ['user_id', 'api_key', 'password'],
        ['123', 'secret', 'password123'],
        ['limit=10']
      )
    })

    it('should sanitize multiple URLs in a single error message', async () => {
      await testUrlSanitization(
        'Failed to connect to https://site1.com/api?user_id=111&api_key=key1 and https://site2.com/posts?auth_user=user2&auth_pass=pass2',
        ['user_id', 'api_key', 'auth_user', 'auth_pass'],
        ['111', 'key1', 'user2', 'pass2']
      )
    })

    it('should handle URLs with case-insensitive parameter matching', async () => {
      await testUrlSanitization(
        'Error with https://api.com/data?USER_ID=123&Api_Key=secret&AUTH_USER=test',
        ['USER_ID', 'Api_Key', 'AUTH_USER'],
        ['123', 'secret', 'test']
      )
    })

    it('should preserve non-sensitive parameters', async () => {
      await testUrlSanitization(
        'Request failed: https://booru.com/posts?limit=50&tags=safe&user_id=123&page=2&api_key=secret',
        ['user_id', 'api_key'],
        ['123', 'secret'],
        ['limit=50', 'tags=safe', 'page=2']
      )
    })

    it('should leave malformed URLs unchanged', async () => {
      const malformedUrl = 'not-a-valid-url-but-contains-user_id=123&api_key=secret'
      await testUrlSanitization(
        `Error with ${malformedUrl}`,
        [], // No params should be redacted since it's not a valid URL
        [],
        [malformedUrl] // Should preserve the malformed URL as-is
      )
    })

    it('should handle errors with empty/default messages gracefully', async () => {
      const testCases = [
        { name: 'explicit empty string', error: new Error('') },
        { name: 'default Error constructor', error: new Error() }
      ]

      for (const { name, error: originalError } of testCases) {
        mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => originalError))

        await new Promise<void>((resolve, reject) => {
          interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
            error: (error) => {
              try {
                expect(error.message).toBe('')
                resolve()
              } catch (err) {
                reject(new Error(`Failed for ${name}: ${err.message}`))
              }
            }
          })
        })
      }
    })

    it('should sanitize stack traces containing sensitive URLs', async () => {
      const sensitiveUrl = 'https://api.com/endpoint?user_id=123&api_key=secret'
      const originalError = new Error('Test error')
      originalError.stack = `Error: Test error
        at someFunction (${sensitiveUrl}:10:5)
        at anotherFunction (file.js:20:10)`

      mockCallHandler.handle = jest.fn().mockReturnValue(throwError(() => originalError))

      return new Promise<void>((resolve, reject) => {
        interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
          error: (error) => {
            try {
              expect(error.stack).toContain('user_id=REDACTED')
              expect(error.stack).toContain('api_key=REDACTED')
              expect(error.stack).not.toContain('123')
              expect(error.stack).not.toContain('secret')
              resolve()
            } catch (err) {
              reject(err)
            }
          }
        })
      })
    })
  })

  describe('Sensitive Parameter Detection', () => {
    it('should detect all configured sensitive parameters', async () => {
      const sensitiveParams = ['user_id', 'api_key', 'password', 'auth_user', 'auth_pass', 'token', 'secret', 'key']
      const paramString = sensitiveParams.map((param, index) => `${param}=${index + 1}`).join('&')

      await testUrlSanitization(
        `All params: https://api.com/test?${paramString}`,
        sensitiveParams,
        Array.from({ length: 8 }, (_, i) => `=${i + 1}`) // ['=1', '=2', '=3', ...]
      )
    })
  })
})
