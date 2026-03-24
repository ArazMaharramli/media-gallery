import type { H3Event, H3Error } from 'h3'
import { getTraceId } from './response'

// Re-export for convenience
export { getTraceId }

// Error codes as defined in API requirements
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_TYPE: 'INVALID_TYPE',
  MISSING_FIELD: 'MISSING_FIELD',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  STATE_CONFLICT: 'STATE_CONFLICT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR'
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export interface ApiErrorBody {
  success: false
  traceId: string
  timestamp: string
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, string[]>
  }
}

export function createApiError(
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: Record<string, string[]>
): H3Error {
  const error = createError({
    statusCode,
    message,
    data: { code, details }
  })
  return error
}

export function formatErrorResponse(error: H3Error | Error, event?: H3Event): ApiErrorBody {
  const isH3Error = 'statusCode' in error
  const traceId = event ? getTraceId(event) : 'unknown'

  let statusCode = 500
  let code: ErrorCode = ErrorCodes.INTERNAL_ERROR
  let message = 'An unexpected error occurred'
  let details: Record<string, string[]> | undefined

  if (isH3Error) {
    const h3Error = error as H3Error
    statusCode = h3Error.statusCode

    // Extract code and details from error data
    if (h3Error.data?.code) {
      code = h3Error.data.code as ErrorCode
    } else {
      // Map HTTP status to error code
      code = mapStatusToCode(statusCode)
    }

    message = h3Error.message
    details = h3Error.data?.details
  } else if (process.env.NODE_ENV !== 'production') {
    message = error.message
  }

  return {
    success: false,
    traceId,
    timestamp: new Date().toISOString(),
    error: {
      code,
      message,
      ...(details && { details })
    }
  }
}

function mapStatusToCode(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 400:
      return ErrorCodes.VALIDATION_ERROR
    case 403:
      return ErrorCodes.FORBIDDEN
    case 404:
      return ErrorCodes.NOT_FOUND
    case 409:
      return ErrorCodes.STATE_CONFLICT
    case 413:
      return ErrorCodes.FILE_TOO_LARGE
    default:
      return ErrorCodes.INTERNAL_ERROR
  }
}

// Helper functions for throwing common errors
export function throwValidationError(message: string, details?: Record<string, string[]>): never {
  throw createApiError(400, ErrorCodes.VALIDATION_ERROR, message, details)
}

export function throwNotFoundError(resource: string, id?: string): never {
  const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`
  throw createApiError(404, ErrorCodes.NOT_FOUND, message)
}

export function throwMissingFieldError(field: string): never {
  throw createApiError(400, ErrorCodes.MISSING_FIELD, `${field} is required`, {
    [field]: [`${field} is required`]
  })
}

export function throwInvalidFormatError(field: string, expectedFormat: string): never {
  throw createApiError(400, ErrorCodes.INVALID_FORMAT, `Invalid format for ${field}`, {
    [field]: [`Expected ${expectedFormat}`]
  })
}

export function throwConflictError(message: string): never {
  throw createApiError(409, ErrorCodes.STATE_CONFLICT, message)
}

export function throwForbiddenError(message: string): never {
  throw createApiError(403, ErrorCodes.FORBIDDEN, message)
}

export function throwInternalError(message = 'An unexpected error occurred'): never {
  throw createApiError(500, ErrorCodes.INTERNAL_ERROR, message)
}
