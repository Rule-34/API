import 'dotenv/config'
import * as Sentry from '@sentry/nestjs'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

const sentryEnabled = ['1', 'true'].includes((process.env['SENTRY_ENABLED'] ?? '').toLowerCase())

Sentry.init({
  enabled: sentryEnabled,
  dsn: process.env['SENTRY_DSN']
})

const otelEndpoint = process.env['OTEL_EXPORTER_OTLP_ENDPOINT']
if (otelEndpoint) {
  const headers = process.env['OTEL_EXPORTER_OTLP_HEADERS']
    ? Object.fromEntries(
        process.env['OTEL_EXPORTER_OTLP_HEADERS']
          .split(',')
          .map((h) => {
            const idx = h.indexOf('=')
            return idx !== -1 ? [h.slice(0, idx).trim(), h.slice(idx + 1).trim()] : [h.trim(), '']
          })
          .filter(([k, v]) => k && v)
      )
    : undefined

  const traceExporter = new OTLPTraceExporter({
    url: `${otelEndpoint.replace(/\/+$/, '')}/v1/traces`,
    headers
  })

  const sdk = new NodeSDK({
    serviceName: process.env['OTEL_SERVICE_NAME'] || 'api.r34.app',
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()]
  })

  sdk.start()
}
