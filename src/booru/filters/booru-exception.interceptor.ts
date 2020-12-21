import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

import { EmptyDataError } from '@alejandroakbal/universal-booru-wrapper'
import { NoContentException } from 'src/exceptions/no-content.exception'

@Injectable()
export class BooruErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof EmptyDataError) {
          return throwError(new NoContentException())
        }

        return throwError(error)
      })
    )
  }
}
