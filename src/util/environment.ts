export function isDevEnv(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function isProdEnv(): boolean {
  return process.env.NODE_ENV === 'production'
}
