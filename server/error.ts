import { formatErrorResponse, getTraceId } from './utils/errors'
import type { H3Event, H3Error } from 'h3'

export default function errorHandler(error: H3Error, event: H3Event) {
  const response = formatErrorResponse(error, event)

  // Log error
  const logLevel = response.error.code === 'INTERNAL_ERROR' ? 'error' : 'warn'
  console[logLevel]('[API Error]', {
    traceId: response.traceId,
    path: event.path,
    method: event.method,
    code: response.error.code,
    message: response.error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  })

  // Set response headers
  const statusCode = 'statusCode' in error ? error.statusCode : 500
  setResponseStatus(event, statusCode)
  setResponseHeader(event, 'Content-Type', 'application/json')
  setResponseHeader(event, 'X-Trace-ID', response.traceId)

  // Set response time if available
  if (event.context.requestStartTime) {
    const duration = Date.now() - event.context.requestStartTime
    setResponseHeader(event, 'X-Response-Time', `${duration}ms`)
  }

  return send(event, JSON.stringify(response))
}
