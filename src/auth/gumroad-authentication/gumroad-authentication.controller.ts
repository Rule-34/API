import { Body, Controller, Header, Post } from '@nestjs/common'
import { GumroadBodyDTO } from './dto/gumroad-body.dto'
import { GumroadAuthenticationService } from './gumroad-authentication.service'

@Controller('auth/gumroad')
export class GumroadAuthenticationController {
  constructor(
    private readonly gumroadAuthenticationService: GumroadAuthenticationService
  ) {}

  @Post('/verify-license')
  @Header('Cache-Control', 'public, max-age=3600')
  VerifyLicense(
    @Body()
    body: GumroadBodyDTO
  ) {
    const { product_permalink, license_key, increment_uses_count } = body

    return this.gumroadAuthenticationService.verifyLicense(
      product_permalink,
      license_key,
      increment_uses_count
    )
  }
}
