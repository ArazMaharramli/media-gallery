# G3: Upload Progress

**Description:** See progress of file uploads with visual feedback.

**Entry Point:** Upload queue on guest upload tab

---

## Acceptance Criteria

- [x] Each file shows individual progress tracking
- [x] Progress shown as percentage and visual bar
- [x] Current file highlighted as "uploading" with animated bar
- [x] Pending files shown as "Waiting..." in gray
- [x] Completed files shown with green checkmark
- [x] Failed files shown with error message in red
- [x] Queue header shows total file count
- [x] "Clear completed" button appears when there are completed/errored items

---

## Queue Item Layout

```
┌─────────────────────────────────────────────────────────┐
│ [🖼]  long_filename_that_gets_trun...              [X] │
│       2.4 MB                                            │
│       ████████████████░░░░░░░░ 72%                      │
└─────────────────────────────────────────────────────────┘
```

---

## UI States

| State | Icon Color | Progress Bar | Text | Action |
|-------|------------|--------------|------|--------|
| Waiting | Blue/Purple | Hidden | "Waiting..." (gray) | None |
| Uploading | Blue/Purple | Blue, animated | "XX%" | Cancel (X) |
| Complete | Blue/Purple | Hidden | ✓ (green) | None |
| Failed | Blue/Purple | Hidden | Error message (red) | Retry, Remove |

---

## Progress Bar Behavior

- Thin bar (1.5px height) below file info
- Smooth transition animation on progress updates
- Blue color (`bg-indigo-600`) during upload
- Percentage shown right-aligned

---

## File Icons

| File Type | Icon | Color |
|-----------|------|-------|
| Image (JPG, PNG, GIF, WEBP) | Photo icon | Blue (`text-blue-500`) |
| Video (MP4, MOV, WEBM) | Video camera icon | Purple (`text-purple-500`) |

---

## Queue Management

- Files are processed sequentially (one at a time)
- New files added to end of queue
- Completed items remain in queue until cleared
- "Clear completed" removes all items with `completed` status
- Failed items stay until retried or manually removed
