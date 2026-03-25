# C4: Watch Video

**Description:** Watch a video in embedded player with next-gen format support.

**Entry Point:** Click on video in grid

---

## Acceptance Criteria

- [x] Click video opens video player overlay
- [x] Native HTML5 video player
- [x] Play/pause controls
- [x] Progress bar / seek
- [x] Volume control
- [x] Fullscreen option
- [x] Download button (original quality)
- [x] WebM/VP9 preview (next-gen, preferred)
- [x] MP4/H.264 preview (fallback)
- [x] Original file fallback if no previews
- [x] Thumbnail image as poster

---

## UI Elements

- Video overlay container (lightbox)
- HTML5 video element with controls
- Multiple `<source>` elements for format selection
- Thumbnail poster image
- Download button (downloads original file)
- Close button
- Previous/Next navigation

---

## Video Format Selection

The video player uses progressive enhancement:

1. **WebM/VP9 preview** - Next-gen format, smaller file size, better quality
2. **MP4/H.264 preview** - Broad compatibility fallback
3. **Original file** - Final fallback if no previews generated

Browser automatically selects the best supported format.
