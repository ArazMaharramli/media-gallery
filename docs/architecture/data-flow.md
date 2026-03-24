# Data Flow

This document illustrates how data flows through the application layers.

---

## 1. Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                          HTTP REQUEST                                │
│  POST /api/events/123/upload                                        │
│  Content-Type: multipart/form-data                                  │
│  Body: { file: <binary> }                                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      1. NUXT SERVER MIDDLEWARE                       │
│  server/middleware/01.trace.ts                                      │
│  ─────────────────────────────────────────────────────────────────  │
│  • Generate/extract trace ID                                         │
│  • Set request start time                                            │
│  • Add trace ID to context                                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      2. API HANDLER                                  │
│  server/api/events/[id]/upload/index.post.ts                        │
│  ─────────────────────────────────────────────────────────────────  │
│  • Parse route params (eventId)                                      │
│  • Call requireEvent middleware (validates event exists)             │
│  • Parse multipart form data                                         │
│  • Validate file (type, size) using Zod schema                      │
│  • Call mediaService.uploadMedia()                                   │
│  • Return createdResponse()                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      3. SERVICE LAYER                                │
│  server/features/media/media.service.ts                             │
│  ─────────────────────────────────────────────────────────────────  │
│  • Orchestrate the upload process                                    │
│  • Call storageService.save() to persist file                       │
│  • Call mediaRepository.create() to save metadata                   │
│  • Queue background variant processing                               │
│  • Return created media object                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌──────────────────────────────┐  ┌──────────────────────────────────┐
│     4a. STORAGE SERVICE      │  │      4b. REPOSITORY LAYER        │
│  server/shared/storage/      │  │  server/features/media/          │
│        local-storage.ts      │  │        media.repository.ts       │
│  ────────────────────────    │  │  ──────────────────────────────  │
│  • Ensure directory exists   │  │  • prisma.media.create()         │
│  • Write file to disk        │  │  • Serialize BigInt → number     │
│  • Return storage key        │  │  • Return media record           │
└──────────────────────────────┘  └──────────────────────────────────┘
                    │                               │
                    ▼                               ▼
┌──────────────────────────────┐  ┌──────────────────────────────────┐
│        FILE SYSTEM           │  │         POSTGRESQL               │
│   uploads/{eventId}/file.jpg │  │  media table                     │
└──────────────────────────────┘  └──────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      5. RESPONSE FORMATTING                          │
│  server/utils/response.ts                                           │
│  ─────────────────────────────────────────────────────────────────  │
│  • Wrap data in standard response format                             │
│  • Add traceId, timestamp                                            │
│  • Set HTTP status code                                              │
│  • Set response headers (X-Trace-ID, X-Response-Time)               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          HTTP RESPONSE                               │
│  Status: 201 Created                                                │
│  Headers: X-Trace-ID: abc-123, X-Response-Time: 45ms                │
│  Body: {                                                            │
│    "success": true,                                                 │
│    "traceId": "abc-123",                                            │
│    "timestamp": "2024-01-15T10:30:00.000Z",                         │
│    "data": { "id": "...", "filename": "...", ... }                  │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Validation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CLIENT (Vue Component)                         │
│  ─────────────────────────────────────────────────────────────────  │
│  import { createEventSchema } from '~/shared/schemas'               │
│                                                                     │
│  const result = createEventSchema.safeParse(formData)               │
│  if (!result.success) {                                             │
│    // Show validation errors to user                                │
│    errors.value = result.error.flatten().fieldErrors                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Form submission
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVER (API Handler)                           │
│  ─────────────────────────────────────────────────────────────────  │
│  import { createEventSchema } from '~/shared/schemas'               │
│                                                                     │
│  const body = await readBody(event)                                 │
│  const result = createEventSchema.safeParse(body)                   │
│                                                                     │
│  if (!result.success) {                                             │
│    throwValidationError('Invalid input', {                          │
│      ...result.error.flatten().fieldErrors                          │
│    })                                                               │
│  }                                                                  │
│                                                                     │
│  // Use validated data                                              │
│  const validData = result.data                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Benefits of Shared Schemas:**
- Same validation rules on client and server
- TypeScript types automatically inferred
- Single source of truth for validation

---

## 3. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       ERROR OCCURS                                   │
│  ─────────────────────────────────────────────────────────────────  │
│  • Not found: throwNotFoundError('Event', id)                       │
│  • Validation: throwValidationError('Invalid', details)             │
│  • State conflict: throwStateConflictError('Token deactivated')     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       CUSTOM ERROR THROWN                            │
│  server/utils/errors.ts                                             │
│  ─────────────────────────────────────────────────────────────────  │
│  class AppError extends Error {                                     │
│    statusCode: number                                               │
│    code: string                                                     │
│    details?: Record<string, string[]>                               │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ERROR HANDLER                                  │
│  server/error.ts + server/plugins/error-handler.ts                  │
│  ─────────────────────────────────────────────────────────────────  │
│  • Catch error                                                       │
│  • Log error details                                                 │
│  • Format error response                                             │
│  • Set HTTP status code                                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ERROR RESPONSE                                 │
│  ─────────────────────────────────────────────────────────────────  │
│  Status: 404 Not Found                                              │
│  Body: {                                                            │
│    "success": false,                                                │
│    "traceId": "abc-123",                                            │
│    "timestamp": "2024-01-15T10:30:00.000Z",                         │
│    "error": {                                                       │
│      "code": "NOT_FOUND",                                           │
│      "message": "Event not found",                                  │
│      "details": { "id": ["abc-123"] }                               │
│    }                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Background Processing Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       UPLOAD HANDLER                                 │
│  ─────────────────────────────────────────────────────────────────  │
│  1. Save original file                                               │
│  2. Create media record (without variants)                          │
│  3. Return response to client immediately                           │
│  4. Trigger background processing (don't await)                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┴─────────────────────┐
              │                                           │
              ▼                                           ▼
┌──────────────────────────┐              ┌──────────────────────────┐
│  IMMEDIATE RESPONSE      │              │  BACKGROUND PROCESSING   │
│  (non-blocking)          │              │  (async)                 │
│  ─────────────────────   │              │  ─────────────────────   │
│  {                       │              │  1. Get processor for    │
│    "id": "media-123",    │              │     MIME type            │
│    "filename": "...",    │              │  2. Generate thumbnail   │
│    "thumbnail": null     │              │  3. Generate preview     │
│  }                       │              │  4. Update media record  │
└──────────────────────────┘              │     with variant paths   │
                                          │  5. Log completion       │
                                          └──────────────────────────┘
                                                        │
                                                        ▼
                                          ┌──────────────────────────┐
                                          │  DATABASE UPDATE         │
                                          │  ─────────────────────   │
                                          │  UPDATE media SET        │
                                          │    thumbnail = '...',    │
                                          │    preview = '...'       │
                                          │  WHERE id = 'media-123'  │
                                          └──────────────────────────┘
```

**Client Handling:**
- Initial response may have `thumbnail: null`
- Client can poll or use optimistic UI
- Thumbnails appear after processing completes

---

## 5. Gallery Access Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Client clicks gallery link: /gallery/abc123xyz                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       NUXT PAGE LOAD                                 │
│  pages/gallery/[token].vue                                          │
│  ─────────────────────────────────────────────────────────────────  │
│  1. Extract token from route params                                  │
│  2. Fetch GET /api/gallery/{token}                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API HANDLER                                    │
│  server/api/gallery/[token].get.ts                                  │
│  ─────────────────────────────────────────────────────────────────  │
│  1. Validate token format                                            │
│  2. Look up ViewToken in database                                    │
│  3. If not found or inactive → 404                                  │
│  4. Get Event details                                                │
│  5. Get Media items (filtered by mediaIds if selective share)       │
│  6. Return event + media data                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          │                                                   │
          ▼                                                   ▼
┌─────────────────────┐                       ┌─────────────────────────┐
│  TOKEN NOT FOUND    │                       │  TOKEN VALID            │
│  ────────────────   │                       │  ─────────────────────  │
│  Status: 404        │                       │  {                      │
│  Show error page    │                       │    "event": {...},      │
└─────────────────────┘                       │    "media": [...]       │
                                              │  }                      │
                                              └─────────────────────────┘
                                                            │
                                                            ▼
                                              ┌─────────────────────────┐
                                              │  RENDER GALLERY         │
                                              │  ─────────────────────  │
                                              │  • Display event name   │
                                              │  • Show media grid      │
                                              │  • Enable lightbox      │
                                              │  • Allow downloads      │
                                              └─────────────────────────┘
```

---

## 6. Data Transformation

### BigInt Handling

PostgreSQL `BIGINT` → JavaScript `BigInt` → JSON `number`

```
┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE                                                            │
│  media.size = 1234567890 (BIGINT column)                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PRISMA CLIENT                                                       │
│  media.size = 1234567890n (JavaScript BigInt)                       │
│  ⚠️ Cannot be serialized to JSON directly                           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  REPOSITORY (serialize.ts)                                           │
│  serializeMedia(media) → { ...media, size: Number(media.size) }     │
│  media.size = 1234567890 (JavaScript number)                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  JSON RESPONSE                                                       │
│  "size": 1234567890                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Date Handling

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT INPUT                                                        │
│  "2024-01-15" (date string from date picker)                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  VALIDATION (Zod schema)                                             │
│  z.string().datetime() → validates ISO format                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SERVICE/REPOSITORY                                                  │
│  new Date("2024-01-15") → JavaScript Date object                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE                                                            │
│  2024-01-15 (DATE column in PostgreSQL)                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  JSON RESPONSE                                                       │
│  "date": "2024-01-15T00:00:00.000Z" (ISO 8601 string)               │
└─────────────────────────────────────────────────────────────────────┘
```
