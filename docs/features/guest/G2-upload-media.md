# G2: Upload Media (Guest)

**Description:** Upload photos and videos to the event via guest link.

**Entry Point:** Guest page with upload permission (`/guest/:token`)

---

## Acceptance Criteria

- [ ] Upload tab visible only if token has `canUpload: true`
- [ ] If token has upload-only permission, upload view shown by default
- [ ] If token has both view and upload, tab bar allows switching
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
- [ ] Success message shown after each upload completes
- [ ] Media is marked as "guest" upload with `guestTokenId` in database
- [ ] Guests can delete their own uploads (always permitted)

---

## UI Elements

- Tab bar (Gallery | Upload) - if both permissions enabled
- Drag & drop zone
- File browser button
- Upload queue list
  - File icon (image/video)
  - Filename
  - File size
  - Progress bar with percentage
  - Cancel button
- Success toast/message
- Error messages with retry option

---

## API

**Upload Media (Guest):**
`POST /api/events/:eventId/upload`

Headers:
- Content-Type: multipart/form-data

Body:
- `file`: The media file
- `guestToken`: The guest token string (optional, for tracking)

**Note:** The upload endpoint validates the guest token from the request context.

---

## Delete Own Uploads

Guests can always delete media they uploaded themselves:

`DELETE /api/guest/:token/media/:mediaId`

- If `media.guestTokenId === guestToken.id`, deletion is allowed
- No `canDelete` permission required for own uploads

---

## Page

`/guest/:token` (Upload tab)
