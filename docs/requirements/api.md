# API Requirements

This document defines API conventions, standards, and patterns. Specific endpoint implementations are derived from feature specifications.

---

## Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://{domain}/api`

---

## Design Principles

1. **RESTful** - Use standard HTTP methods and resource-based URLs
2. **Consistent** - All responses follow unified format
3. **Stateless** - No server-side session state
4. **Traceable** - Every request has a unique trace ID

---

## HTTP Methods

| Method | Usage |
|--------|-------|
| GET | Retrieve resource(s) |
| POST | Create resource |
| PUT | Replace resource |
| PATCH | Partial update |
| DELETE | Remove resource |

---

## URL Conventions

```
/api/{resource}              # Collection
/api/{resource}/{id}         # Single item
/api/{resource}/{id}/{action}  # Action on item
/api/{resource}/{id}/{sub}   # Sub-resource
```

**Guidelines:**
- Use plural nouns for resources (`/events`, not `/event`)
- Use kebab-case for multi-word resources (`/upload-tokens`)
- Use path parameters for identifiers
- Use query parameters for filtering, pagination, sorting

---

## Unified Response Format

All API responses follow a consistent structure.

### Success Response

```json
{
  "success": true,
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    // Response payload
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful responses |
| `traceId` | string | UUID v4 - unique request identifier for debugging |
| `timestamp` | string | ISO 8601 timestamp of the response |
| `data` | object/array | The response payload |

### Error Response

```json
{
  "success": false,
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable error message",
    "details": {
      // Optional additional context
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `false` for error responses |
| `traceId` | string | UUID v4 - same format as success |
| `timestamp` | string | ISO 8601 timestamp |
| `error.code` | string | Machine-readable error code (SCREAMING_SNAKE_CASE) |
| `error.message` | string | Human-readable error description |
| `error.details` | object | Optional - field errors, constraints, etc. |

---

## HTTP Status Codes

### Success Codes

| Status | Usage |
|--------|-------|
| 200 OK | Successful GET, PUT, PATCH, DELETE |
| 201 Created | Successful POST that creates a resource |
| 204 No Content | Successful request with no response body |

### Client Error Codes

| Status | Usage |
|--------|-------|
| 400 Bad Request | Invalid request body, parameters, or business logic error |
| 401 Unauthorized | Authentication required (future) |
| 403 Forbidden | Authenticated but not permitted (future) |
| 404 Not Found | Resource does not exist |
| 409 Conflict | Resource state conflict |
| 413 Payload Too Large | Request body exceeds limit |
| 422 Unprocessable Entity | Valid JSON but semantic errors |

### Server Error Codes

| Status | Usage |
|--------|-------|
| 500 Internal Server Error | Unexpected server error |
| 502 Bad Gateway | Upstream service error |
| 503 Service Unavailable | Server temporarily unavailable |

---

## Error Codes

Standard error codes to use across all endpoints:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `INVALID_FORMAT` | 400 | Malformed data (date, UUID, etc.) |
| `INVALID_TYPE` | 400 | Unsupported type (file type, etc.) |
| `MISSING_FIELD` | 400 | Required field not provided |
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_EXISTS` | 409 | Resource already exists |
| `STATE_CONFLICT` | 409 | Invalid state transition |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `STORAGE_ERROR` | 500 | File storage operation failed |
| `DATABASE_ERROR` | 500 | Database operation failed |

---

## Request Headers

### Required Headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | `application/json` | For JSON request bodies |
| `Content-Type` | `multipart/form-data` | For file uploads |

### Optional Headers

| Header | Value | Description |
|--------|-------|-------------|
| `Accept` | `application/json` | Expected response format |
| `X-Request-ID` | UUID | Client-provided request ID (if not provided, server generates) |

---

## Response Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | Response MIME type |
| `X-Trace-ID` | Same as `traceId` in response body |
| `X-Response-Time` | Request processing time in ms |

---

## Authentication

### MVP Approach

No user authentication. Access control via:
- **Resource IDs** - knowing the event ID grants access
- **Tokens** - 16-character random strings for shared links

### Token Format

- Length: 16 characters
- Characters: alphanumeric (a-z, A-Z, 0-9)
- Generation: cryptographically secure random
- Entropy: ~95 bits (sufficient for public links)

### Future Considerations

- JWT-based authentication
- API keys for integrations
- OAuth 2.0 for third-party access

---

## File Upload

### Constraints

| Constraint | Value |
|------------|-------|
| Max file size | 500 MB |
| Files per request | 1 |
| Request timeout | 10 minutes |

### Supported MIME Types

**Images:**
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

**Videos:**
- `video/mp4`
- `video/quicktime` (MOV)
- `video/webm`

### Upload Request Format

```http
POST /api/{upload-endpoint}
Content-Type: multipart/form-data

file: [binary data]
```

### Upload Response

Returns metadata of uploaded file with generated IDs and URLs.

---

## Media Serving

### Endpoint

`GET /api/uploads/{eventId}/{filename}`

### Query Parameters

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `variant` | string | `thumbnail`, `preview` | Optional. If omitted, serves original file |

### Variant Behavior

| Variant | Size | Format | Usage |
|---------|------|--------|-------|
| (none) | Original | Original | Downloads |
| `thumbnail` | 300px width | WebP/JPEG | Grid thumbnails |
| `preview` | 1200px width | WebP/JPEG | Lightbox viewing |

### Format Negotiation

The server checks the `Accept` header to determine format:
- If `Accept` contains `image/webp` → serves WebP variant
- Otherwise → serves JPEG fallback

### Fallback Behavior

If requested variant doesn't exist (e.g., legacy uploads, videos):
- Falls back to original file
- No error returned

### Response Headers

| Header | Value |
|--------|-------|
| `Content-Type` | `image/webp`, `image/jpeg`, or original MIME type |
| `Content-Length` | File size in bytes |
| `Cache-Control` | `public, max-age=31536000` |

---

## Pagination

For list endpoints returning many items:

### Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max 100) |
| `sort` | string | `-createdAt` | Sort field (prefix `-` for descending) |

### Response Format

```json
{
  "success": true,
  "traceId": "...",
  "timestamp": "...",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Rate Limiting

### MVP

No rate limiting implemented.

### Production Recommendations

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Read (GET) | 100 | per minute |
| Write (POST/PUT/PATCH) | 30 | per minute |
| Upload | 10 | per minute |
| Download | 50 | per minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312260
```

---

## Validation Rules

### String Fields

| Constraint | Example |
|------------|---------|
| Required | `name` cannot be empty |
| Min length | `name.minLength(1)` |
| Max length | `name.maxLength(100)` |
| Pattern | `token.pattern(/^[a-zA-Z0-9]{16}$/)` |

### Date Fields

- Format: ISO 8601 (`YYYY-MM-DD` for dates, full ISO for timestamps)
- Timezone: UTC for storage, converted for display

### ID Fields

- Format: UUID v4
- Generation: Server-side only

---

## CORS

### Development

Allow all origins for local development.

### Production

```http
Access-Control-Allow-Origin: https://{allowed-domain}
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Request-ID
Access-Control-Max-Age: 86400
```

---

## Versioning

### MVP

No versioning. Single version at `/api/`.

### Future

URL-based versioning when breaking changes needed:
- `/api/v1/events`
- `/api/v2/events`

---

## Logging & Tracing

Every request should log:

| Field | Description |
|-------|-------------|
| `traceId` | Unique request identifier |
| `method` | HTTP method |
| `path` | Request path |
| `status` | Response status code |
| `duration` | Processing time in ms |
| `ip` | Client IP address |
| `userAgent` | Client user agent |

---

## Security Considerations

1. **Input Validation** - Validate and sanitize all input
2. **Output Encoding** - Escape output to prevent XSS
3. **SQL Injection** - Use parameterized queries (Prisma handles this)
4. **File Validation** - Verify MIME types by content, not just extension
5. **Rate Limiting** - Implement for production
6. **HTTPS** - Enforce in production
7. **Headers** - Set security headers (CSP, X-Frame-Options, etc.)
