import { SetMetadata } from '@nestjs/common'

export const BOORU_CACHE_POLICY_METADATA_KEY = 'booru:cache-policy'

export const BooruCachePolicy = (policy: string) => SetMetadata(BOORU_CACHE_POLICY_METADATA_KEY, policy)
