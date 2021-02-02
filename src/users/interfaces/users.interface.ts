import { GumroadAPIResponse } from './gumroad.interface'

export interface UserData {
  success: GumroadAPIResponse['success']
  is_subscription_valid: boolean
  license_uses: GumroadAPIResponse['uses']
  sale_timestamp: GumroadAPIResponse['purchase']['sale_timestamp']
  email: GumroadAPIResponse['purchase']['email']
}
