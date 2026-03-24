# C5: Download Media

**Description:** Download individual media files.

**Entry Point:** Lightbox or video player download button

---

## Acceptance Criteria

- [ ] Download button in lightbox/player
- [ ] Downloads **original file** (full resolution, uncompressed)
- [ ] Original filename is preserved
- [ ] Correct Content-Type header
- [ ] Browser saves file automatically
- [ ] Downloads are NOT the compressed preview/thumbnail variants

---

## Important Notes

- **Viewing vs Downloading:** When viewing in lightbox, users see optimized previews (1200px WebP/JPEG). Downloads always provide the original full-resolution file.
- **File Size:** Original files may be significantly larger than the optimized previews shown in the gallery.

---

## API

`GET /api/uploads/{eventId}/{filename}`

No `variant` parameter = original file
