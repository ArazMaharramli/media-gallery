# Chunked/Resumable Uploads

**Description:** Enable reliable uploads for large files (5GB+) with pause/resume capability, especially important for mobile users on unreliable networks.

**Protocol:** [tus - resumable upload protocol](https://tus.io/)

---

## Problem Statement

Current buffered uploads have critical limitations:

| Issue | Impact |
|-------|--------|
| Entire file loaded into memory | 5GB video = 5GB RAM, crashes server |
| No resume on failure | Connection drop = start over |
| No progress persistence | Browser refresh = lost progress |
| Mobile unfriendly | Unreliable networks cause failures |

---

## Acceptance Criteria

### Server-Side
- [ ] Implement tus protocol endpoints
- [ ] Support chunked file reception (5MB chunks)
- [ ] Store upload metadata (filename, size, progress)
- [ ] Handle chunk reassembly on completion
- [ ] Clean up stale/abandoned uploads (24h TTL)
- [ ] Integrate with existing media processing pipeline
- [ ] Memory usage < 10MB per concurrent upload

### Client-Side
- [ ] Chunk files before upload (5MB default)
- [ ] Track uploaded chunks in localStorage
- [ ] Resume from last successful chunk on retry
- [ ] Show accurate progress (per-chunk)
- [ ] Handle network errors gracefully
- [ ] Support pause/resume UI controls

### Integration
- [ ] Works with photographer upload page
- [ ] Works with guest upload page
- [ ] Triggers media processing after completion
- [ ] Creates database record on completion
- [ ] Backward compatible (small files still work)

---

## Technical Specification

### tus Protocol Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tus` | Create new upload |
| HEAD | `/api/tus/:uploadId` | Get upload status/offset |
| PATCH | `/api/tus/:uploadId` | Upload chunk data |
| DELETE | `/api/tus/:uploadId` | Cancel upload |

### Request/Response Flow

```
1. CREATE UPLOAD
   POST /api/tus
   Headers:
     Upload-Length: 5368709120
     Upload-Metadata: filename base64,filetype base64,eventId base64

   Response: 201 Created
     Location: /api/tus/abc123

2. UPLOAD CHUNKS
   PATCH /api/tus/abc123
   Headers:
     Upload-Offset: 0
     Content-Type: application/offset+octet-stream
   Body: [binary chunk data]

   Response: 204 No Content
     Upload-Offset: 5242880

3. RESUME (after failure)
   HEAD /api/tus/abc123

   Response: 200 OK
     Upload-Offset: 15728640
     Upload-Length: 5368709120

4. CONTINUE FROM OFFSET
   PATCH /api/tus/abc123
   Headers:
     Upload-Offset: 15728640
   Body: [next chunk]
```

### Storage Structure

```
uploads/
├── temp/
│   └── {uploadId}/
│       ├── data              # Concatenated chunks
│       └── metadata.json     # Upload info
│           {
│             "id": "abc123",
│             "filename": "video.mp4",
│             "mimeType": "video/mp4",
│             "size": 5368709120,
│             "offset": 15728640,
│             "eventId": "event-uuid",
│             "guestTokenId": "token-uuid",
│             "createdAt": "2024-01-01T00:00:00Z",
│             "expiresAt": "2024-01-02T00:00:00Z"
│           }
└── {eventId}/
    └── {final-filename}.mp4  # Moved after completion
```

### Chunk Size Configuration

| File Size | Chunk Size | Rationale |
|-----------|------------|-----------|
| < 100MB | 1MB | Fast completion |
| 100MB - 1GB | 5MB | Balanced |
| > 1GB | 10MB | Fewer requests |

Default: **5MB** (configurable)

---

## Dependencies

### Server
```json
{
  "@tus/server": "^1.x",
  "@tus/file-store": "^1.x"
}
```

### Client
```json
{
  "tus-js-client": "^4.x"
}
```

Or use [Uppy](https://uppy.io/) for full-featured upload UI.

---

## Server Implementation

```typescript
// server/api/tus/[...path].ts
import { Server } from '@tus/server'
import { FileStore } from '@tus/file-store'

const tusServer = new Server({
  path: '/api/tus',
  datastore: new FileStore({
    directory: './uploads/temp'
  }),
  namingFunction: () => crypto.randomUUID(),
  onUploadCreate: async (req, res, upload) => {
    // Validate eventId, guestToken, file type
    const metadata = parseMetadata(upload.metadata)
    await validateUpload(metadata)
  },
  onUploadFinish: async (req, res, upload) => {
    // Move to final location
    // Create database record
    // Trigger media processing
    await finalizeUpload(upload)
  }
})

export default defineEventHandler((event) => {
  return tusServer.handle(event.node.req, event.node.res)
})
```

---

## Client Implementation

```typescript
// composables/useChunkedUpload.ts
import * as tus from 'tus-js-client'

export function useChunkedUpload(endpoint: string) {
  const progress = ref(0)
  const status = ref<'idle' | 'uploading' | 'paused' | 'complete' | 'error'>('idle')

  let upload: tus.Upload | null = null

  function start(file: File, metadata: Record<string, string>) {
    upload = new tus.Upload(file, {
      endpoint,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      chunkSize: 5 * 1024 * 1024, // 5MB
      metadata: {
        filename: file.name,
        filetype: file.type,
        ...metadata
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        progress.value = Math.round((bytesUploaded / bytesTotal) * 100)
      },
      onSuccess: () => {
        status.value = 'complete'
      },
      onError: (error) => {
        status.value = 'error'
        console.error('Upload failed:', error)
      }
    })

    // Check for previous upload
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length > 0) {
        upload!.resumeFromPreviousUpload(previousUploads[0])
      }
      upload!.start()
      status.value = 'uploading'
    })
  }

  function pause() {
    upload?.abort()
    status.value = 'paused'
  }

  function resume() {
    upload?.start()
    status.value = 'uploading'
  }

  return { progress, status, start, pause, resume }
}
```

---

## Cleanup Strategy

### Stale Upload Cleanup

```typescript
// server/tasks/cleanup-stale-uploads.ts
// Run via cron every hour

const STALE_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours

async function cleanupStaleUploads() {
  const tempDir = './uploads/temp'
  const uploads = await readdir(tempDir)

  for (const uploadId of uploads) {
    const metadataPath = join(tempDir, uploadId, 'metadata.json')
    const metadata = JSON.parse(await readFile(metadataPath, 'utf-8'))

    if (Date.now() - new Date(metadata.createdAt).getTime() > STALE_THRESHOLD) {
      await rm(join(tempDir, uploadId), { recursive: true })
      console.log(`Cleaned up stale upload: ${uploadId}`)
    }
  }
}
```

---

## UI Requirements

### Upload Progress Component

```
┌─────────────────────────────────────────────────────────┐
│  📁 wedding_video.mp4                                   │
│  ┌───────────────────────────────────────────────┐     │
│  │████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░│ 45% │
│  └───────────────────────────────────────────────┘     │
│  2.4 GB of 5.3 GB uploaded • 12 MB/s • ~4 min left    │
│                                                         │
│  [⏸ Pause]  [✕ Cancel]                                 │
└─────────────────────────────────────────────────────────┘
```

### Resume Prompt (on page reload)

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Incomplete Upload Found                             │
│                                                         │
│  wedding_video.mp4 - 45% complete                       │
│                                                         │
│  [Resume Upload]  [Start Over]  [Discard]              │
└─────────────────────────────────────────────────────────┘
```

---

## Error Handling

| Error | User Message | Recovery |
|-------|-------------|----------|
| Network timeout | "Connection lost. Retrying..." | Auto-retry with backoff |
| Server error (5xx) | "Server error. Will retry..." | Auto-retry |
| Invalid file type | "File type not supported" | Show allowed types |
| File too large | "File exceeds 10GB limit" | Cannot proceed |
| Storage full | "Server storage full" | Contact admin |
| Upload expired | "Upload session expired" | Start new upload |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Memory per upload | < 10MB |
| Concurrent uploads | 10+ per server |
| Chunk upload latency | < 2s per 5MB chunk |
| Resume detection | < 500ms |
| Cleanup job duration | < 1 minute |

---

## Security Considerations

- Validate eventId/guestTokenId before accepting upload
- Enforce file type restrictions via metadata validation
- Rate limit upload creation (prevent DoS)
- Authenticate chunk uploads via upload ID (unguessable UUID)
- Clean up incomplete uploads to prevent disk exhaustion
- Validate final file size matches declared size

---

## Migration Path

1. **Phase 1**: Add tus endpoints alongside existing upload
2. **Phase 2**: Update client to use tus for files > 50MB
3. **Phase 3**: Make tus the default for all uploads
4. **Phase 4**: Remove legacy buffered upload endpoints
