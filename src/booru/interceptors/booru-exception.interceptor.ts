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
        if (error instanceof EmptyDataError) {
          return throwError(new NoContentException(error.message))
          //
        } else if (error instanceof EndpointError) {
          return throwError(new MethodNotAllowedException(error.message))
        }

        return throwError(error)
      })
    )
  }
}
