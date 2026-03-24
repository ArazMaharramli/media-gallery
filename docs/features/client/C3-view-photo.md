# C3: View Photo

**Description:** View a photo in full-screen lightbox.

**Entry Point:** Click on photo in grid

---

## Acceptance Criteria

- [ ] Click photo opens lightbox overlay
- [ ] Lightbox shows **optimized preview** (1200px width, WebP with JPEG fallback)
- [ ] Preview loads quickly due to compression
- [ ] Navigation arrows for prev/next photos
- [ ] Keyboard navigation (arrow keys, ESC)
- [ ] Click outside or ESC closes lightbox
- [ ] Download button provides **original full-resolution** file
- [ ] Image counter (e.g., "3 / 45")

---

## UI Elements

- Full-screen dark overlay
- Large image display (optimized preview)
- Left/right navigation arrows
- Close button (X)
- Download button (downloads original)
- Image counter

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ← | Previous photo |
| → | Next photo |
| ESC | Close lightbox |

---

## Image Loading

| Context | Image Served | Size |
|---------|-------------|------|
| Grid thumbnail | `?variant=thumbnail` | 300px width |
| Lightbox preview | `?variant=preview` | 1200px width |
| Download | Original (no variant) | Full resolution |
