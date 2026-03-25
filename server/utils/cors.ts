/**
 * CORS utility for tus upload endpoints
 * Provides configurable origin restriction
 */
import type { H3Event } from 'h3'

/**
 * Get the allowed CORS origin based on configuration
 * Falls back to request origin for same-origin in development
 */
export function getCorsOrigin(event: H3Event): string {
  const config = useRuntimeConfig()
  // Access cors config (may not be typed, so use type assertion)
  const corsConfig = config as { cors?: { origin?: string } }
  const publicConfig = config.public as { appUrl?: string }

  const configuredOrigin = corsConfig.cors?.origin || publicConfig?.appUrl

  // If origin is explicitly configured, use it
  if (configuredOrigin) {
    return configuredOrigin
  }

  // In development or when not configured, use request origin (safer than *)
  const requestOrigin = getHeader(event, 'origin')
  if (requestOrigin) {
    return requestOrigin
  }

  // Fallback for same-origin requests (no Origin header)
  const host = getHeader(event, 'host')
  const protocol = getHeader(event, 'x-forwarded-proto') || 'http'
  return host ? `${protocol}://${host}` : ''
}

/**
 * Set standard tus CORS headers for an event
 */
export function setTusCorsHeaders(event: H3Event): void {
  const origin = getCorsOrigin(event)

  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, HEAD, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Authorization, Content-Type, Upload-Length, Upload-Metadata, Upload-Offset, Upload-Checksum, Tus-Resumable, Upload-Concat, Upload-Defer-Length',
    'Access-Control-Expose-Headers':
      'Upload-Offset, Location, Upload-Length, Tus-Version, Tus-Resumable, Tus-Max-Size, Tus-Extension, Upload-Metadata, Upload-Defer-Length, Upload-Concat',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true'
  })
}
