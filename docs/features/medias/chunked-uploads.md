# Chunked/Resumable Uploads

**Description:** All file uploads use the tus protocol for reliable, resumable uploads with pause/resume capability.

**Protocol:** [tus - resumable upload protocol](https://tus.io/)

---

## Overview

All uploads (photos and videos) use chunked uploads via the tus protocol. This provides:

| Feature | Benefit |
|---------|---------|
| Chunked transfer | Low memory usage (~5MB per upload) |
| Pause/Resume | User control over large uploads |
| Auto-retry | Survives network interruptions |
| Parallel uploads | All files upload simultaneously |
| Progress persistence | Resume after page refresh |
| Checksum verification | Data integrity guaranteed |

---

## Implementation Status

### Server-Side
- [x] tus protocol endpoints (`/api/tus`)
- [x] Chunked file reception (5MB chunks)
- [x] File-based context persistence (survives server restart)
- [x] SHA-256 checksum verification
- [x] Chunk reassembly on completion
- [x] Stale upload cleanup (24h TTL, hourly cron)
- [x] Integration with media processing pipeline
- [x] Memory usage < 10MB per concurrent upload

### Client-Side
- [x] tus-js-client integration
- [x] Client-side SHA-256 checksum calculation
- [x] localStorage persistence for resume
- [x] Parallel file uploads (all files start immediately)
- [x] Pause/resume UI controls
- [x] Accurate per-chunk progress

### Integration
- [x] Works with photographer upload page
- [x] Works with guest upload page
- [x] Triggers media processing after completion
- [x] Creates database record on completion

---

## Configuration

```typescript
// nuxt.config.ts
runtimeConfig: {
  upload: {
    maxChunkedSize: 10 * 1024 * 1024 * 1024, // 10GB
    staleThresholdHours: 24
  },
  public: {
    upload: {
      chunkSize: 5 * 1024 * 1024, // 5MB
      maxChunkedSize: 10 * 1024 * 1024 * 1024 // 10GB
    }
  }
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `chunkSize` | 5MB | Size of each upload chunk |
| `maxChunkedSize` | 10GB | Maximum file size |
| `staleThresholdHours` | 24h | Cleanup threshold for abandoned uploads |

---

## Architecture

### File Structure

```
server/
├── api/tus/
│   ├── index.ts          # POST - Create upload
│   └── [id].ts           # HEAD, PATCH, DELETE - Upload operations
├── features/tus/
│   ├── tus.server.ts     # tus server configuration
│   ├── tus.service.ts    # Upload finalization
│   ├── tus.validation.ts # Metadata validation
│   ├── tus.checksum.ts   # SHA-256 verification
│   └── tus.types.ts      # Type definitions
└── tasks/
    └── cleanup-stale-uploads.ts

composables/
├── useMediaUpload.ts     # Main upload composable
├── useChunkedUpload.ts   # tus-js-client wrapper
└── useUploadStrategy.ts  # File size validation
```

### Storage Structure

```
uploads/
├── temp/
│   ├── {uploadId}              # Partial upload data
│   ├── {uploadId}.json         # tus metadata
│   └── {uploadId}.context.json # Validated context (eventId, guestToken)
└── {eventId}/
    └── {final-filename}.mp4    # Completed upload
```

---

## Upload Flow

### Parallel Upload Processing

```
User selects files
       ↓
   ┌───┴───┐
   ↓   ↓   ↓
File1 File2 File3  ← All start immediately
   ↓   ↓   ↓
  tus tus tus      ← Each uses tus protocol
   ↓   ↓   ↓
Progress updates   ← Watch handles all status
   ↓   ↓   ↓
Complete/Error     ← Independent completion
```

### Single File Flow

```
1. CREATE UPLOAD
   POST /api/tus
   Headers:
     Upload-Length: 5368709120
     Upload-Metadata: filename,filetype,eventId,checksum

   Response: 201 Created
     Location: /api/tus/abc123

2. UPLOAD CHUNKS (sequential per file)
   PATCH /api/tus/abc123
   Headers:
     Upload-Offset: 0
     Content-Type: application/offset+octet-stream
   Body: [5MB chunk]

   Response: 204 No Content
     Upload-Offset: 5242880

3. ON COMPLETION
   - Verify SHA-256 checksum
   - Move file to final location
   - Create database record
   - Trigger media processing
```

---

## Checksum Verification

### Client-Side
```typescript
// Calculate SHA-256 before upload
const buffer = await file.arrayBuffer()
const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
const checksum = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))

// Send in metadata
metadata: {
  checksum: `sha256 ${checksum}`
}
```

### Server-Side
```typescript
// Verify on upload completion
const actualChecksum = await calculateFileChecksum(filePath, 'sha256')
if (actualChecksum !== expectedChecksum) {
  throw new Error('Checksum mismatch - file corrupted')
}
```

---

## Context Persistence

Upload context (eventId, guestToken validation) is persisted to disk:

```typescript
// On upload create - save context
await saveUploadContext(uploadId, {
  eventId,
  guestTokenId,
  uploadedBy,
  validatedAt: new Date().toISOString()
})

// On upload finish - load context
const context = await loadUploadContext(uploadId)
await finalizeUpload(upload, context)
```

This ensures uploads survive server restarts.

---

## Client Usage

### Basic Upload

```typescript
const {
  uploadQueue,
  addFiles,
  pauseUpload,
  resumeUpload,
  cancelUpload
} = useMediaUpload('/api/tus', onComplete, {
  metadata: { eventId: 'xxx' }
})

// Add files - they start immediately in parallel
addFiles([file1, file2, file3])

// Control individual uploads
pauseUpload(uploadId)
resumeUpload(uploadId)
cancelUpload(uploadId)
```

### Resumable Uploads (after page refresh)

```typescript
const { resumableUploads, hasResumableUploads } = useMediaUpload(...)

// Show banner if incomplete uploads exist
if (hasResumableUploads.value) {
  // Display: "2 incomplete uploads - drop same files to resume"
}
```

---

## UI States

| State | Visual | Actions |
|-------|--------|---------|
| Uploading | Blue progress bar, XX% | Pause, Cancel |
| Paused | Yellow progress bar | Resume, Cancel |
| Completed | Green checkmark | Clear |
| Error | Red, error message | Retry, Remove |

### Upload Progress Component

```
┌─────────────────────────────────────────────────────────┐
│  📁 wedding_video.mp4                                   │
│  ┌───────────────────────────────────────────────┐     │
│  │████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░│ 45% │
│  └───────────────────────────────────────────────┘     │
│  2.4 GB of 5.3 GB uploaded                              │
│                                                         │
│  [⏸ Pause]  [✕ Cancel]                                 │
└─────────────────────────────────────────────────────────┘
```

### Resumable Uploads Banner

```
┌─────────────────────────────────────────────────────────┐
│  🔄 2 incomplete uploads - drop same files to resume:   │
│                                                         │
│  [wedding_video.mp4 (45%)] [IMG_001.jpg (78%)]   [×]   │
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
| Checksum mismatch | "File corrupted during upload" | Auto-retry |
| Upload expired | "Upload session expired" | Start new upload |

---

## Cleanup

Stale uploads are cleaned up automatically:

```typescript
// server/tasks/cleanup-stale-uploads.ts
// Runs every hour via Nitro scheduled tasks
// Removes uploads older than 24 hours
```

Configuration in `nuxt.config.ts`:
```typescript
nitro: {
  experimental: { tasks: true },
  scheduledTasks: {
    '0 * * * *': ['cleanup-stale-uploads']
  }
}
```

---

## Security

- eventId/guestToken validated before accepting upload
- File type restrictions enforced via metadata validation
- SHA-256 checksum verification prevents corruption
- Context persisted to disk (survives restart)
- Unguessable UUID for upload IDs
- CORS configured for same-origin (configurable)
