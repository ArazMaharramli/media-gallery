import { randomUUID } from 'crypto'
import type { H3Event } from 'h3'

export interface ApiSuccessResponse<T> {
  success: true
  traceId: string
  timestamp: string
  data: T
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiErrorResponse {
  success: false
  traceId: string
  timestamp: string
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function getTraceId(event: H3Event): string {
  // Use client-provided request ID or generate one
  const clientId = getHeader(event, 'x-request-id')
  if (clientId && isValidUUID(clientId)) {
    return clientId
  }

  // Get from context if already set by middleware
  if (event.context.traceId) {
    return event.context.traceId
  }

  // Generate new one
  const traceId = randomUUID()
  event.context.traceId = traceId
  return traceId
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export function successResponse<T>(event: H3Event, data: T, statusCode = 200): ApiSuccessResponse<T> {
  const traceId = getTraceId(event)

  setResponseStatus(event, statusCode)
  setResponseHeader(event, 'Content-Type', 'application/json')
  setResponseHeader(event, 'X-Trace-ID', traceId)

  // Set response time if available
  if (event.context.requestStartTime) {
    const duration = Date.now() - event.context.requestStartTime
    setResponseHeader(event, 'X-Response-Time', `${duration}ms`)
  }

  return {
    success: true,
    traceId,
    timestamp: new Date().toISOString(),
    data
  }
}

export function paginatedResponse<T>(
  event: H3Event,
  items: T[],
  pagination: { page: number; limit: number; total: number }
): ApiSuccessResponse<PaginatedData<T>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return successResponse(event, {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    }
  })
}

export function createdResponse<T>(event: H3Event, data: T): ApiSuccessResponse<T> {
  return successResponse(event, data, 201)
}
