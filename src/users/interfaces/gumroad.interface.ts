export interface GumroadAPIRequest {
  product_permalink: string
  license_key: string
  increment_uses_count: boolean
}

export interface GumroadAPIResponse {
  success: boolean
  uses: number
  purchase: GumroadPurchase
}

interface GumroadPurchase {
  permalink: string
  product_permalink: string
  email: string
  sale_timestamp: string
  license_key: string
  recurrence: string
  refunded: boolean
  disputed: boolean
  dispute_won: boolean
  id: string
  created_at: Date
  subscription_cancelled_at?: Date
  subscription_failed_at?: Date
}
