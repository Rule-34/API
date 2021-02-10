import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  MethodNotAllowedException,
} from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import {
  EmptyDataError,
  EndpointError,
} from '@alejandroakbal/universal-booru-wrapper'
import { NoContentException } from '../../common/exceptions/no-content.exception'

@Injectable()
export class BooruErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Throw better errors
        switch (error.constructor) {
          case EmptyDataError:
            return throwError(new NoContentException(undefined, error.message))

          case EndpointError:
            return throwError(
              new MethodNotAllowedException(undefined, error.message)
            )

          default:
            return throwError(error)
        }
      })
    )
  }
}
