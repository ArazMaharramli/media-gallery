# Client Features

Clients receive a view link from the photographer to browse and download media.

---

## Overview

Clients can:
- Access gallery via shared view link
- Browse photos and videos in grid or list view
- Toggle between view modes (grid/list)
- View photos in full-screen lightbox
- Watch videos in embedded player
- Download individual media files

---

## Features

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| [C1](./C1-access-gallery.md) | Access Gallery | Open gallery via shared link | High |
| [C2](./C2-browse-media-grid.md) | Browse Media | View media in grid or list view with toggle | High |
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
           ├── [Toggle View] → [Grid View / List View]
           |
           ├── [Scroll] → [Lazy Load More]
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

---

## Gallery Page Layout

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            John & Jane Wedding                  │
│               June 15, 2024                     │
│                                                 │
├─────────────────────────────────────────────────┤
│  20 items                    [Grid] [List]      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Grid View:                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │     │ │     │ │ ▶   │ │     │ │     │      │
│  │     │ │     │ │0:45 │ │     │ │     │      │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │
│                                                 │
│  List View:                                     │
│  ┌─────────────────────────────────────────┐   │
│  │ [□] IMG_001.jpg  Photo  2.4MB    [👁][↓] │   │
│  │ [□] VID_002.mp4  Video  45MB     [👁][↓] │   │
│  │ [□] IMG_003.jpg  Photo  1.8MB    [👁][↓] │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│              [Load More]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```
