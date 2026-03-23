import { randomUUID } from 'crypto'

export default defineEventHandler((event) => {
  // Only handle API routes
  if (!event.path.startsWith('/api')) {
    return
  }

  // Set request start time for response timing
  event.context.requestStartTime = Date.now()

  // Set trace ID from client header or generate new one
  const clientTraceId = getHeader(event, 'x-request-id')
  event.context.traceId = clientTraceId || randomUUID()
})
