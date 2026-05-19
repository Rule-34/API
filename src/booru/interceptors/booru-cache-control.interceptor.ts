import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { BOORU_CACHE_CONTROL_POLICIES } from '../constants/cache-control-policies'
import { BOORU_CACHE_POLICY_METADATA_KEY } from '../decorators/booru-cache-policy.decorator'
import type { BooruHttpRequest } from '../interfaces/booru-http.interface'

interface HeaderResponse {
  header(name: string, value: string): void
}

@Injectable()
export class BooruCacheControlInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<HeaderResponse | undefined>()
    const request = context.switchToHttp().getRequest<BooruHttpRequest>()
    const cachePolicy = this.reflector.getAllAndOverride<string | undefined>(BOORU_CACHE_POLICY_METADATA_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (cachePolicy === undefined || cachePolicy === '') {
      return next.handle()
    }

    // Only write success-path policies here. Thrown responses are left to
    // BooruErrorsInterceptor so strict error headers are not replaced later.
    return next.handle().pipe(
      tap(() => {
        if (!response || typeof response.header !== 'function') {
          return
        }

        // Keep both checks on purpose:
        // - raw query params catch partial auth URLs that should never be shared-cacheable
        // - resolved auth context catches requests that actually used query credentials
        if (this.hasAuthQueryParams(request) || request.booruAuthContext?.source === 'query') {
          response.header('Cache-Control', BOORU_CACHE_CONTROL_POLICIES.PRIVATE_AUTH)
          return
        }

        response.header('Cache-Control', cachePolicy)
      })
    )
  }

  private hasAuthQueryParams(request: BooruHttpRequest): boolean {
    return request.query?.auth_user !== undefined || request.query?.auth_pass !== undefined
  }
}
