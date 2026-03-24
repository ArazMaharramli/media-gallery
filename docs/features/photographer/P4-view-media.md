# P4: View Media

**Description:** View uploaded photos and videos.

**Entry Point:** Click on media item in dashboard grid

---

## P4.1: Media Grid

### Acceptance Criteria

- [ ] Grid displays thumbnails (optimized 300px WebP with JPEG fallback)
- [ ] List view displays thumbnails (same optimization)
- [ ] Thumbnails load quickly due to compression
- [ ] Browser automatically receives WebP or JPEG based on Accept header

---

## P4.2: Photo Lightbox

### Acceptance Criteria

- [ ] Click photo opens lightbox overlay
- [ ] Lightbox shows **optimized preview** (1200px WebP/JPEG), not full-resolution
- [ ] Preview loads faster than original due to compression
- [ ] Navigation arrows for prev/next photos
- [ ] Keyboard navigation (arrow keys, ESC)
- [ ] Click outside or ESC closes lightbox
- [ ] Download button downloads **original full-resolution** file

---

## P4.3: Video Player

### Acceptance Criteria

- [ ] Click video opens video player overlay
- [ ] Native HTML5 video player
- [ ] Play/pause controls
- [ ] Progress bar / seek
- [ ] Volume control
- [ ] Fullscreen option
- [ ] Download button downloads original video file

---

## Media Serving

### URL Variants

| Variant | URL Pattern | Usage |
|---------|-------------|-------|
| Thumbnail | `/api/uploads/{eventId}/{filename}?variant=thumbnail` | Grid/list views |
| Preview | `/api/uploads/{eventId}/{filename}?variant=preview` | Lightbox viewing |
| Original | `/api/uploads/{eventId}/{filename}` | Downloads |

### Browser Format Negotiation

The server automatically serves:
- **WebP** if browser sends `Accept: image/webp`
- **JPEG fallback** for browsers without WebP support

This is transparent to the frontend - just request the variant and the server handles format selection.
