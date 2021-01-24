import { HttpException, HttpService, Injectable } from '@nestjs/common'
import { AxiosRequestConfig } from 'axios'

@Injectable()
export class GumroadAuthService {
  protected readonly gumroadLicenseVerificationEndpoint =
    'https://api.gumroad.com/v2/licenses/verify'

  constructor(private httpService: HttpService) {}

  async verifyLicense(productPermalink, licenseKey, incrementUsesCount) {
    const requestConfig: AxiosRequestConfig = {
      method: 'POST',

      url: this.gumroadLicenseVerificationEndpoint,

      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },

      data:
        'product_permalink=' +
        productPermalink +
        '&license_key=' +
        licenseKey +
        '&increment_uses_count=' +
        incrementUsesCount,
    }

    const response = this.httpService.request(requestConfig)

    const responseData = await response
      .toPromise()
      //
      .catch((error) => {
        throw new HttpException(error.response.data, error.response.status)
      })

    return responseData.data
  }
}
