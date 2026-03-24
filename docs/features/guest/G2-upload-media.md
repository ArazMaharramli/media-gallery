# G2: Upload Media (Guest)

**Description:** Upload photos and videos to the event via guest link.

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
- [x] Maximum file size: 500MB per file
- [x] Invalid files silently filtered when adding to queue
- [x] Files upload sequentially (queue, one at a time)
- [x] Upload queue shown with file icon, filename, size, progress bar
- [x] File icons: blue for images, purple for videos
- [x] Currently uploading file shows progress percentage
- [x] Pending files shown as "Waiting..."
- [x] Completed files show green checkmark
- [x] Failed files show error message with retry/remove buttons
- [x] Individual uploads can be cancelled before completion
- [x] "Clear completed" button removes finished items from queue
- [x] Media marked as "guest" upload with `guestTokenId` in database
- [x] Uploaded media immediately appears in own uploads
- [x] Guests can always delete their own uploads

---

## UI Elements

### Upload Section (Left Side)

- Drag & drop zone with dashed border
- Cloud upload icon
- "Click to upload or drag and drop" text
- Supported formats text
- Upload queue list below dropzone

### QR Code Section (Right Side, Desktop Only)

- QR code in bordered container
- "Scan to upload from mobile" text
- "Copy Link" button

### Upload Queue Item

```
┌────────────────────────────────────────────────────────┐
│ [Icon]  filename.jpg                                   │
│         2.4 MB                                         │
│         ████████████░░░░░░░░ 65%                   [X] │
└────────────────────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| Icon | 🖼 Blue (image) or 🎬 Purple (video) |
| Filename | Truncated with ellipsis if too long |
| Size | Formatted file size (KB/MB) |
| Progress | Bar with percentage (uploading) |
| Status | "Waiting...", percentage, ✓, or error |
| Actions | Cancel (X), Retry (↻), Remove (X) |

---

## Upload States

| State | Visual | Actions Available |
|-------|--------|-------------------|
| Pending | Gray, "Waiting..." | (queued, no action) |
| Uploading | Blue progress bar, XX% | Cancel |
| Completed | Green checkmark | (auto stays in list) |
| Error | Red, error message | Retry, Remove |

---

## API

**Upload Media (Guest):**
`POST /api/guest/:token/upload`

Headers:
- Content-Type: multipart/form-data

Body:
- `file`: The media file

Response:
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

## Page

`/guest/:token` (Upload tab)
