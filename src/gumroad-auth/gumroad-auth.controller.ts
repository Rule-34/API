import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { GumroadBodyDTO } from './dto/gumroad-body.dto'
import { GumroadAuthService } from './gumroad-auth.service'

@Controller('auth/gumroad')
export class GumroadAuthController {
  constructor(private readonly gumroadAuthService: GumroadAuthService) {}

  @Post('/verify-license')
  @HttpCode(HttpStatus.OK)
  VerifyLicense(
    @Body()
    body: GumroadBodyDTO
  ) {
    const { product_permalink, license_key, increment_uses_count } = body

    return this.gumroadAuthService.verifyLicense(
      product_permalink,
      license_key,
      increment_uses_count
    )
  }
}
