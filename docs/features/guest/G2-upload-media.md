# G2: Upload Media (Guest)

**Description:** Upload photos and videos to the event via guest link with pause/resume capability.

**Entry Point:** Guest page with upload permission (`/guest/:token`)

---

## Acceptance Criteria

- [x] Upload tab visible only if token has `canUpload: true`
- [x] If token has upload-only permission, upload tab shown by default
- [x] If token has both view and upload, tab bar allows switching
- [x] Drag-and-drop upload zone with matching height to QR section
- [x] Click to browse files is available
- [x] Multiple file selection is supported
- [x] Supported image formats: JPG, JPEG, PNG, GIF, WEBP
- [x] Supported video formats: MP4, MOV, WEBM
- [x] Maximum file size: 10GB per file
- [x] All files start uploading immediately (parallel)
- [x] Upload queue shown with file icon, filename, size, progress bar
- [x] File icons: blue for images, purple for videos
- [x] All uploads show progress percentage and bytes uploaded
- [x] Uploads can be paused and resumed
- [x] Completed files show green checkmark
- [x] Failed files show error message with retry/remove buttons
- [x] Individual uploads can be cancelled
- [x] "Clear completed" button removes finished items from queue
- [x] Media marked as "guest" upload with `guestTokenId` in database
- [x] Uploaded media immediately appears in own uploads
- [x] Guests can always delete their own uploads
- [x] Incomplete uploads shown in banner after page refresh
- [x] Upload tab shows indicator for active/resumable uploads

---

## Upload Features

### Parallel Uploads
All selected files start uploading immediately - no queue waiting. Users see progress on all files at once.

### Pause/Resume
Any upload can be paused to free up bandwidth for other files, then resumed later.

### Resume After Refresh
If the browser is closed or page refreshed:
- Incomplete uploads shown in amber banner
- Drop the same files to resume from where they left off
- Files matched by name and size

### Upload Tab Indicator
- Blue badge with count when uploads are active
- Amber dot when resumable uploads exist

---

## UI Elements

### Upload Section (Left Side)

- Drag & drop zone with dashed border
- Cloud upload icon
- "Click to upload or drag and drop" text
- "JPG, PNG, GIF, WEBP, MP4, MOV, WEBM up to 10GB"
- Upload queue list below dropzone
- Resumable uploads banner (when applicable)

### QR Code Section (Right Side, Desktop Only)

- QR code in bordered container
- "Scan to upload from mobile" text
- "Copy Link" button

### Upload Queue Item

```
┌────────────────────────────────────────────────────────┐
│ [Icon]  filename.jpg                                   │
│         2.4 MB                                         │
│         ████████████░░░░░░░░ 65%            [⏸] [X]   │
│         1.6 MB of 2.4 MB                               │
└────────────────────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| Icon | Blue (image) or Purple (video) |
| Filename | With tooltip for full name |
| Size | Formatted file size (KB/MB/GB) |
| Progress | Bar with percentage |
| Bytes | "X MB of Y MB" for large files |
| Actions | Pause/Resume, Cancel |

### Resumable Uploads Banner

```
┌────────────────────────────────────────────────────────┐
│ 🔄 2 incomplete uploads - drop same files to resume:   │
│                                                        │
│ [video.mp4 (45%)] [photo.jpg (78%)]        [Dismiss]  │
└────────────────────────────────────────────────────────┘
```

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
| POST | `/api/tus` | Create upload (with guestToken metadata) |
| HEAD | `/api/tus/:uploadId` | Get upload status |
| PATCH | `/api/tus/:uploadId` | Upload chunk |
| DELETE | `/api/tus/:uploadId` | Cancel upload |

Metadata includes:
- `guestToken` - Guest access token
- `filename` - Original filename
- `filetype` - MIME type
- `checksum` - SHA-256 hash

Response on completion:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "eventId": "...",
    "guestTokenId": "...",
    "filename": "abc123.jpg",
    "originalName": "IMG_001.jpg",
    "mimeType": "image/jpeg",
    "size": 2457600,
    "type": "photo",
    "uploadedBy": "guest",
    "thumbnail": "abc123_thumb.webp",
    "thumbnailFallback": "abc123_thumb.jpg",
    "preview": "abc123_preview.webp",
    "previewFallback": "abc123_preview.jpg",
    "createdAt": "2024-06-15T14:30:00Z"
  }
}
```

---

## Delete Own Uploads

Guests can always delete media they uploaded themselves:

`DELETE /api/guest/:token/media/:mediaId`

- If `media.guestTokenId === guestToken.id`, deletion is allowed
- No `canDelete` permission required for own uploads
- Shared media requires `canDelete` permission

---

## Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| Max file size | 10GB | Maximum size per file |
| Chunk size | 5MB | Size of each upload chunk |

See [Chunked Uploads](../medias/chunked-uploads.md) for full technical details.

---

## Page

`/guest/:token` (Upload tab)
