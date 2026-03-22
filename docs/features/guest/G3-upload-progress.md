# G3: Upload Progress

**Description:** See progress of file uploads.

**Entry Point:** Upload queue on upload page

---

## Acceptance Criteria

- [ ] Each file shows individual progress bar
- [ ] Progress shown as percentage
- [ ] Current file highlighted as "uploading"
- [ ] Pending files shown as "waiting"
- [ ] Completed files shown as "done" or removed from queue
- [ ] Failed files shown with error and retry option

---

## UI States

| State | Visual |
|-------|--------|
| Waiting | Gray, "Waiting..." text |
| Uploading | Blue progress bar, percentage |
| Complete | Green checkmark, then removed |
| Failed | Red, error message, retry button |
