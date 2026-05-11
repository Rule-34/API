export const BOORU_CACHE_CONTROL_POLICIES = {
  POSTS: 'public, max-age=300, s-maxage=14400, stale-while-revalidate=3600',
  RANDOM_POSTS: 'no-store, no-cache, must-revalidate',
  SINGLE_POST: 'public, max-age=21600, s-maxage=604800, stale-while-revalidate=86400',
  TAGS: 'public, max-age=21600, s-maxage=604800, stale-while-revalidate=86400',
  PRIVATE_AUTH: 'private, no-store',
  ERROR: 'no-store, no-cache, must-revalidate'
} as const
