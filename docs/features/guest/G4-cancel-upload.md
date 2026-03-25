# G4: Cancel/Pause/Resume Upload

**Description:** Control uploads with pause, resume, cancel, and retry actions.

**Entry Point:** Action buttons on upload queue items

---

## Acceptance Criteria

- [x] Pause button shown on uploading items
- [x] Resume button shown on paused items
- [x] Cancel button shown on uploading and paused items
- [x] Cancel aborts tus upload and removes from queue
- [x] Pause stops upload, preserves progress
- [x] Resume continues from last uploaded chunk
- [x] Failed uploads show Retry and Remove buttons
- [x] Retry creates new upload and restarts
- [x] Remove deletes failed item from queue
- [x] "Clear completed" removes all completed/errored items
- [x] User can re-add same files after cancel

---

## Queue Item Actions

| State | Actions | Buttons |
|-------|---------|---------|
| Uploading | Pause, Cancel | ⏸ (pause), X (cancel) |
| Paused | Resume, Cancel | ▶ (play), X (cancel) |
| Complete | Clear | (via "Clear completed") |
| Error | Retry, Remove | ↻ (refresh), X (remove) |

---

## Implementation Details

### Pause Upload
```typescript
function pauseUpload(id: string) {
  const item = uploadQueue.value.find(i => i.id === id)
  if (item?.tusUploadId) {
    chunkedUpload.pause(item.tusUploadId)
    // Status updates via watch
  }
}
```

### Resume Upload
```typescript
function resumeUpload(id: string) {
  const item = uploadQueue.value.find(i => i.id === id)
  if (item?.tusUploadId) {
    chunkedUpload.resume(item.tusUploadId)
    // Continues from last chunk
  }
}
```

### Cancel Upload
```typescript
function cancelUpload(id: string) {
  const item = uploadQueue.value.find(i => i.id === id)
  if (item?.tusUploadId) {
    chunkedUpload.cancel(item.tusUploadId)
  }
  // Remove from queue
  uploadQueue.value = uploadQueue.value.filter(i => i.id !== id)
}
```

### Retry (Error)
```typescript
function retryUpload(id: string) {
  const item = uploadQueue.value.find(i => i.id === id)
  if (item) {
    // Clean up old tus upload
    if (item.tusUploadId) {
      chunkedUpload.remove(item.tusUploadId)
    }
    // Reset and restart
    item.status = 'uploading'
    item.progress = 0
    startUpload(item.id, item.file)
  }
}
```

### Clear Completed
```typescript
function clearCompleted() {
  // Clean up tus instances
  for (const item of uploadQueue.value) {
    if (item.status === 'completed' || item.status === 'error') {
      if (item.tusUploadId) chunkedUpload.remove(item.tusUploadId)
    }
  }
  // Filter queue
  uploadQueue.value = uploadQueue.value.filter(
    i => i.status === 'uploading' || i.status === 'paused'
  )
}
```

---

## UI Behavior

### Button Visibility

| State | Pause | Resume | Cancel | Retry | Remove |
|-------|-------|--------|--------|-------|--------|
| Uploading | ✓ | - | ✓ | - | - |
| Paused | - | ✓ | ✓ | - | - |
| Complete | - | - | - | - | - |
| Error | - | - | - | ✓ | ✓ |

### Interactions

- Buttons have hover states for visual feedback
- No confirmation dialogs - actions are immediate
- Pausing a file allows other files to use more bandwidth
- Cancelled files can be re-added by selecting again
