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

`POST /api/upload/:eventId`

---

## Upload Flow

```
[Select Files] → [Add to Queue] → [Upload One by One] → [Show in Grid]
                       ↓
                 [Can Cancel]
```
