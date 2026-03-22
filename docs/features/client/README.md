# Client Features

Clients receive a view link from the photographer to browse and download media.

---

## Overview

Clients can:
- Access gallery via shared view link
- Browse photos and videos in a grid
- View photos in full-screen lightbox
- Watch videos in embedded player
- Download individual media files

---

## Features

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| [C1](./C1-access-gallery.md) | Access Gallery | Open gallery via shared link | High |
| [C2](./C2-browse-media-grid.md) | Browse Media Grid | View thumbnails in responsive grid | High |
| [C3](./C3-view-photo.md) | View Photo | Full-screen lightbox | High |
| [C4](./C4-watch-video.md) | Watch Video | Embedded video player | Medium |
| [C5](./C5-download-media.md) | Download Media | Download individual files | High |

---

## User Journey

```
[Receive Link from Photographer]
           |
           v
[Click Link] ──→ [Invalid?] ──→ [404 Page]
           |
           v
[Gallery Page]
           |
           ├── [Scroll Grid] → [Lazy Load More]
           |
           ├── [Click Photo] → [Lightbox]
           |         |
           |         ├── [Navigate] → [Prev/Next]
           |         |
           |         └── [Download] → [Save File]
           |
           └── [Click Video] → [Video Player]
                     |
                     ├── [Play/Pause/Seek]
                     |
                     └── [Download] → [Save File]
```

---

## What Clients Cannot Do

- Create or edit events
- Upload media
- Delete media
- Access photographer dashboard
- Generate new share links
- See upload tokens or guest uploads marked as "guest"
