# G4: Cancel Upload

**Description:** Cancel, retry, or remove uploads from the queue.

**Entry Point:** Action buttons on upload queue items

---

## Acceptance Criteria

- [x] Cancel button (X) shown on uploading items
- [x] In-progress uploads: XMLHttpRequest aborted, item removed from queue
- [x] Pending uploads: wait in queue until their turn
- [x] No confirmation needed for cancel
- [x] Failed uploads show Retry and Remove buttons
- [x] Retry resets item to pending and re-queues
- [x] Remove deletes failed item from queue
- [x] "Clear completed" button removes all completed items at once
- [x] User can re-add same files after cancel/remove

---

## Queue Item Actions

| State | Action | Button | Behavior |
|-------|--------|--------|----------|
| Pending | - | None | Waits in queue |
| Uploading | Cancel | X (cross) | Aborts XHR, removes from queue |
| Complete | - | None | Stays until cleared |
| Error | Retry | ↻ (refresh) | Resets to pending, re-queues |
| Error | Remove | X (cross) | Removes from queue |

---

## Implementation Details

### Cancel (Uploading)
```typescript
function cancelUpload(id: string) {
  const item = uploadQueue.value.find(i => i.id === id)
  if (item?.xhr) {
    item.xhr.abort()  // Triggers 'abort' event
  }
}
```

### Retry (Error)
```typescript
function retryUpload(id: string) {
  const item = uploadQueue.value.find(i => i.id === id)
  if (item) {
    item.status = 'pending'
    item.progress = 0
    item.error = undefined
    processQueue()  // Start processing if not already
  }
}
```

### Remove (Error)
```typescript
function removeFromQueue(id: string) {
  const index = uploadQueue.value.findIndex(i => i.id === id)
  if (index !== -1) {
    uploadQueue.value.splice(index, 1)
  }
}
```

### Clear Completed
```typescript
function clearCompleted() {
  uploadQueue.value = uploadQueue.value.filter(i => i.status !== 'completed')
}
```

---

## UI Behavior

- Cancel button appears only during active upload
- Retry/Remove buttons appear only on failed items
- "Clear completed" button appears in queue header when there are completed or errored items
- Buttons have hover states for visual feedback
- No confirmation dialogs - actions are immediate
