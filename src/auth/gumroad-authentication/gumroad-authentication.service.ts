import { HttpService, Injectable } from '@nestjs/common'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class GumroadAuthenticationService {
  protected readonly gumroadLicenseVerificationEndpoint =
    'https://api.gumroad.com/v2/licenses/verify'

  constructor(private httpService: HttpService) {}

  verifyLicense(
    productPermalink,
    licenseKey,
    incrementUsesCount
  ): Observable<AxiosResponse<any>> {
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

    // Pipe it because Axios saves the data inside the `data` attribute
    const responseData = response.pipe(map((response) => response.data))

    return responseData
  }
}
