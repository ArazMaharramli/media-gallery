# G3: Upload Progress

**Description:** See progress of file uploads with visual feedback and pause/resume controls.

**Entry Point:** Upload queue on guest upload tab

---

## Acceptance Criteria

- [x] Each file shows individual progress tracking
- [x] Progress shown as percentage and visual bar
- [x] All files upload in parallel (no waiting)
- [x] Uploading files show pause button
- [x] Paused files show yellow progress bar
- [x] Bytes uploaded shown for large files
- [x] Completed files shown with green checkmark
- [x] Failed files shown with error message in red
- [x] Queue header shows total file count
- [x] "Clear completed" button for completed/errored items
- [x] Resumable uploads banner after page refresh

---

## Queue Item Layout

```
┌─────────────────────────────────────────────────────────┐
│ [🎬]  long_filename_that_gets_trun...          [⏸] [X] │
│       2.4 GB                                            │
│       ████████████████░░░░░░░░ 72%                      │
│       1.7 GB of 2.4 GB                                  │
└─────────────────────────────────────────────────────────┘
```

---

## UI States

| State | Progress Bar | Text | Actions |
|-------|--------------|------|---------|
| Uploading | Blue, animated | XX%, bytes uploaded | Pause, Cancel |
| Paused | Yellow | XX%, bytes uploaded | Resume, Cancel |
| Complete | Hidden | ✓ (green) | Clear |
| Error | Hidden | Error message (red) | Retry, Remove |

---

## Progress Bar Behavior

- Thin bar (1.5px height) below file info
- Smooth transition animation on progress updates
- Blue color (`bg-indigo-600`) during upload
- Yellow color (`bg-yellow-500`) when paused
- Percentage shown right-aligned

---

## File Icons

| File Type | Icon | Color |
|-----------|------|-------|
| Image (JPG, PNG, GIF, WEBP) | Photo icon | Blue (`text-blue-500`) |
| Video (MP4, MOV, WEBM) | Video camera icon | Purple (`text-purple-500`) |

---

## Upload Management

### Parallel Processing
- All files start uploading immediately
- No queue waiting - browser limits connections (~6)
- Users can pause large files to prioritize others

### Pause/Resume
- Click pause to stop a large upload
- Progress is preserved
- Resume continues from last chunk

### Resume After Refresh
- Incomplete uploads tracked in localStorage
- Banner shows resumable files after page refresh
- Drop same files to continue uploading

---

## Detailed Progress

For large files (typically videos), show additional detail:

```
1.7 GB of 2.4 GB uploaded
```

This helps users understand actual progress for multi-gigabyte uploads.
