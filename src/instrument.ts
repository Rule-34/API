import 'dotenv/config'
import * as Sentry from '@sentry/nestjs'

const sentryEnabled = ['1', 'true'].includes((process.env['SENTRY_ENABLED'] ?? '').toLowerCase())

Sentry.init({
  enabled: sentryEnabled,
  dsn: process.env['SENTRY_DSN']
})
