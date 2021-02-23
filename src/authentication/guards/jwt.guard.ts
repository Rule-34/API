import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtBooruGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    // Always return true so the request gets added to req.user, we have to manually check if it is not valid.
    try {
      await super.canActivate(context)

      return true
    } catch (error) {
      return true
    }
  }
}

// Correct way
export class JwtGuard extends AuthGuard('jwt') {}
