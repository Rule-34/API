export const BOORU_CACHE_CONTROL_POLICIES = {
  // Browser: 5 minutes. Shared cache/CDN: 4 hours. Serve stale for 1 hour while revalidating. Never serve stale on error.
  POSTS: 'public, max-age=300, s-maxage=14400, stale-while-revalidate=3600, stale-if-error=0',
  // Never store; every request must fetch fresh data.
  RANDOM_POSTS: 'no-store, no-cache, must-revalidate',
  // Browser: 6 hours. Shared cache/CDN: 7 days. Serve stale for 1 day while revalidating. Never serve stale on error.
  SINGLE_POST: 'public, max-age=21600, s-maxage=604800, stale-while-revalidate=86400, stale-if-error=0',
  // Browser: 6 hours. Shared cache/CDN: 7 days. Serve stale for 1 day while revalidating. Never serve stale on error.
  TAGS: 'public, max-age=21600, s-maxage=604800, stale-while-revalidate=86400, stale-if-error=0',
  // Private auth-bearing responses are never shared and never stored.
  PRIVATE_AUTH: 'private, no-store',
  // Error responses are never stored and must always be revalidated.
  ERROR: 'no-store, no-cache, must-revalidate'
} as const
