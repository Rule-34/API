import { GumroadAPIResponse } from './gumroad.interface'

export interface UserData {
  license_uses: GumroadAPIResponse['uses']
  is_subscription_valid: boolean
  sale_timestamp: GumroadAPIResponse['purchase']['sale_timestamp']
  email: GumroadAPIResponse['purchase']['email']
}
