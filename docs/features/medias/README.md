# Upload Features

This directory contains requirements for upload-related features that handle large media files efficiently.

---

## Overview

The Media Gallery supports uploads from photographers (event owners) and guests (via shared links). Given that media files can be large (20MB+ images, 5GB+ videos), specialized handling is required.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| [Chunked Uploads](./chunked-uploads.md) | 📋 Planned | Resumable uploads using tus protocol |
| [Range Requests](./range-requests.md) | 📋 Planned | HTTP 206 partial content for video seeking |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐              ┌──────────────┐             │
│  │ File Select  │              │ Video Player │             │
│  └──────┬───────┘              └──────┬───────┘             │
│         │                             │                      │
│         ▼                             ▼                      │
│  ┌──────────────┐              ┌──────────────┐             │
│  │ tus Client   │              │ Range Request│             │
│  │ (chunked)    │              │ (seeking)    │             │
│  └──────┬───────┘              └──────┬───────┘             │
│         │                             │                      │
└─────────┼─────────────────────────────┼──────────────────────┘
          │                             │
          ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        SERVER                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐              ┌──────────────┐             │
│  │ /api/tus/*   │              │ /api/uploads │             │
│  │ POST chunks  │              │ GET + Range  │             │
│  └──────┬───────┘              └──────┬───────┘             │
│         │                             │                      │
│         ▼                             ▼                      │
│  ┌──────────────┐              ┌──────────────┐             │
│  │ Assemble &   │              │ Partial Read │             │
│  │ Process      │              │ (streaming)  │             │
│  └──────┬───────┘              └──────────────┘             │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    STORAGE                           │    │
│  │  uploads/{eventId}/                                  │    │
│  │    ├── original.mp4      (5GB)                      │    │
│  │    ├── original_preview.webm (200MB)                │    │
│  │    ├── original_preview.mp4  (250MB)                │    │
│  │    └── original_thumb.webp   (50KB)                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## File Size Limits

| File Type | Current Limit | With Chunked Uploads |
|-----------|---------------|---------------------|
| Images | 500MB | 500MB (no change) |
| Videos | 500MB | **10GB** |

---

## Memory Usage

| Operation | Current | With Improvements |
|-----------|---------|-------------------|
| Upload (5GB video) | 5GB+ RAM | ~10MB RAM |
| View (5GB video) | Stream | Stream (partial) |
| Seek in video | Download all | Download needed portion |

---

## Implementation Priority

1. **Range Requests** (Quick Win)
   - ~50 lines of code
   - Fixes iOS video playback
   - Enables seeking
   - No client-side changes needed

2. **Chunked Uploads** (High Value)
   - ~200 lines server + client
   - Enables large file uploads
   - Resume on failure
   - Better mobile experience

---

## Dependencies

```json
{
  "@tus/server": "^1.x",
  "@tus/file-store": "^1.x",
  "tus-js-client": "^4.x"
}
```

---

## Related Documentation

- [Technical Requirements](../../requirements/technical.md) - File constraints
- [Non-Functional Requirements](../../requirements/non-functional.md) - Performance targets
- [Video Playback](../client/C4-watch-video.md) - Client video features
- [Guest Upload](../guest/G2-upload-media.md) - Guest upload flow
