# P3: Upload Media

**Description:** Upload photos and videos to the event using chunked uploads with pause/resume capability.

**Entry Point:** Event dashboard upload zone

---

## Acceptance Criteria

- [x] Drag-and-drop upload zone is available
- [x] Click to browse files is available
- [x] Multiple file selection is supported
- [x] Supported image formats: JPG, JPEG, PNG, GIF, WEBP
- [x] Supported video formats: MP4, MOV, WEBM
- [x] Maximum file size: 10GB per file
- [x] All files start uploading immediately (parallel)
- [x] Upload queue shows: icon, filename, size, progress bar
- [x] All uploads show progress percentage
- [x] Uploads can be paused and resumed
- [x] Individual uploads can be cancelled
- [x] Completed uploads appear in media grid
- [x] Upload errors displayed with retry option
- [x] Incomplete uploads can be resumed after page refresh

### Media Optimization (Images)
- [x] Thumbnail variant generated (300px width, WebP + JPEG fallback)
- [x] Preview variant generated (1200px width, WebP + JPEG fallback)
- [x] Original file preserved for downloads
- [x] Variant generation happens server-side on upload
- [x] Failed variant generation does not block upload (graceful fallback)

### Media Optimization (Videos)
- [x] Thumbnail extracted from video frame at 1 second (WebP + JPEG fallback)
- [x] Original video preserved (no transcoding)
- [x] Thumbnail uses ffmpeg for frame extraction
- [x] Failed thumbnail generation shows play icon fallback

---

## Upload Features

### Parallel Uploads
All selected files start uploading immediately. The browser naturally limits concurrent connections (~6), and users can pause individual uploads if needed.

### Pause/Resume
Large video uploads can be paused to prioritize smaller files, then resumed later. Progress is preserved.

### Resume After Refresh
If the page is refreshed during upload:
- Incomplete uploads are shown in a banner
- User can drop the same files to resume from where they left off
- Files are matched by name and size

### Checksum Verification
SHA-256 checksums ensure data integrity:
- Client calculates checksum before upload
- Server verifies checksum after all chunks received
- Corrupted uploads are automatically retried

---

## UI Elements

- Drag & drop zone
- File browser button
- Upload queue list
  - File icon (image/video)
  - Filename (with tooltip for full name)
  - File size
  - Progress bar with percentage
  - Bytes uploaded / total size
  - Pause/Resume button
  - Cancel button
- Resumable uploads banner (when applicable)
- Error messages with retry option

---

## Upload States

| State | Visual | Actions |
|-------|--------|---------|
| Uploading | Blue progress bar, XX% | Pause, Cancel |
| Paused | Yellow progress bar | Resume, Cancel |
| Completed | Green checkmark | Clear |
| Error | Red, error message | Retry, Remove |

---

## API

All uploads use the tus protocol:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tus` | Create new upload |
| HEAD | `/api/tus/:uploadId` | Get upload status |
| PATCH | `/api/tus/:uploadId` | Upload chunk |
| DELETE | `/api/tus/:uploadId` | Cancel upload |

Metadata includes:
- `eventId` - Event identifier
- `filename` - Original filename
- `filetype` - MIME type
- `checksum` - SHA-256 hash

---

## Upload Flow

```
[Select Files] → [All Start Uploading] → [Generate Variants] → [Show in Grid]
                        ↓
                 [Can Pause/Resume/Cancel]
                        ↓
              [Resume After Page Refresh]
```

---

## File Variants

### Images

| Variant | Filename Pattern | Size | Format |
|---------|-----------------|------|--------|
| Original | `{uuid}.{ext}` | Full size | Original |
| Thumbnail | `{uuid}_thumb.webp` | 300px width | WebP |
| Thumbnail Fallback | `{uuid}_thumb.jpg` | 300px width | JPEG |
| Preview | `{uuid}_preview.webp` | 1200px width | WebP |
| Preview Fallback | `{uuid}_preview.jpg` | 1200px width | JPEG |

### Videos

| Variant | Filename Pattern | Size | Format |
|---------|-----------------|------|--------|
| Original | `{uuid}.{ext}` | Full size | Original (MP4/MOV/WEBM) |
| Thumbnail | `{uuid}_thumb.webp` | 300px width | WebP (frame at 1s) |
| Thumbnail Fallback | `{uuid}_thumb.jpg` | 300px width | JPEG (frame at 1s) |

**Note:** Videos are not transcoded or compressed. Only thumbnail frames are extracted using ffmpeg.

---

## Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Max file size | 10GB | Maximum size per file |
| Chunk size | 5MB | Size of each upload chunk |
| Stale cleanup | 24h | Abandoned uploads deleted after |

See [Chunked Uploads](../medias/chunked-uploads.md) for full technical details.
