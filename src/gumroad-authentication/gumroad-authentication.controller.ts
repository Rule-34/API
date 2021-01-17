import { Body, Controller, Post } from '@nestjs/common'
import { GumroadBodyDTO } from './dto/gumroad-body.dto'

@Controller('auth/gumroad')
export class GumroadAuthenticationController {
  @Post('/')
  async VerifyLicense(
    @Body()
    body: GumroadBodyDTO
  ) {
    const { product_permalink, license_key, increment_uses_count } = body

    const gumroadLicenseVerificationEndpoint =
      'https://api.gumroad.com/v2/licenses/verify'

    const requestInit: RequestInit = {
      method: 'POST',

      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },

      body:
        'product_permalink=' +
        product_permalink +
        '&license_key=' +
        license_key +
        '&increment_uses_count=' +
        increment_uses_count,
    }

    const request = new Request(gumroadLicenseVerificationEndpoint, requestInit)

    return await fetch(request)
  }
}
