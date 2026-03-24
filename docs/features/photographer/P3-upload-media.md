# P3: Upload Media

**Description:** Upload photos and videos to the event.

**Entry Point:** Event dashboard upload zone

---

## Acceptance Criteria

- [ ] Drag-and-drop upload zone is available
- [ ] Click to browse files is available
- [ ] Multiple file selection is supported
- [ ] Supported image formats: JPG, JPEG, PNG, GIF, WEBP
- [ ] Supported video formats: MP4, MOV, WEBM
- [ ] Maximum file size: 500MB per file
- [ ] Files upload sequentially (queue, one at a time for max speed)
- [ ] Upload queue shown as list: icon, filename, size, progress bar
- [ ] Currently uploading file shows progress percentage
- [ ] Pending files shown in queue with "waiting" state
- [ ] Individual uploads can be cancelled before completion
- [ ] Cancel removes file from queue (if pending) or aborts upload (if in progress)
- [ ] Completed uploads appear in media grid
- [ ] Upload errors are displayed to user with option to retry

### Media Optimization (Images)
- [ ] Thumbnail variant generated (300px width, WebP + JPEG fallback)
- [ ] Preview variant generated (1200px width, WebP + JPEG fallback)
- [ ] Original file preserved for downloads
- [ ] Variant generation happens server-side on upload
- [ ] Failed variant generation does not block upload (graceful fallback)

### Media Optimization (Videos)
- [ ] Thumbnail extracted from video frame at 1 second (WebP + JPEG fallback)
- [ ] Original video preserved (no transcoding)
- [ ] Thumbnail uses ffmpeg for frame extraction
- [ ] Failed thumbnail generation shows play icon fallback

---

## UI Elements

- Drag & drop zone
- File browser button
- Upload queue list
  - File icon (image/video)
  - Filename
  - File size
  - Progress bar with percentage
  - Cancel button
- Error messages with retry option

---

## API

`POST /api/events/:eventId/upload`

### Response includes:
- Media ID
- Filename
- Variant paths (thumbnail, preview, fallbacks)

---

## Upload Flow

```
[Select Files] → [Add to Queue] → [Upload One by One] → [Generate Variants] → [Show in Grid]
                       ↓
                 [Can Cancel]
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
