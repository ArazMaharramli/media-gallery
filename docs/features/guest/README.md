# Guest Features

Guests receive an upload link from the photographer to contribute their own photos and videos.

---

## Overview

Guests can:
- Access upload page via shared upload link
- Upload photos and videos to the event
- See upload progress
- Cancel pending uploads

---

## Features

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| [G1](./G1-access-upload-page.md) | Access Upload Page | Open upload page via shared link | High |
| [G2](./G2-upload-media.md) | Upload Media | Upload photos and videos | High |
| [G3](./G3-upload-progress.md) | Upload Progress | See progress of uploads | High |
| [G4](./G4-cancel-upload.md) | Cancel Upload | Cancel pending uploads | Medium |

---

## User Journey

```
[Receive Link from Photographer]
           |
           v
[Click Link] ──→ [Invalid/Deactivated?] ──→ [404 Page]
           |
           v
[Upload Page]
           |
           v
[See Event Name & Instructions]
           |
           v
[Select Files] ──→ [Drag & Drop or Browse]
           |
           v
[Files Added to Queue]
           |
           ├── [Cancel] → [Remove from Queue]
           |
           v
[Upload Starts] ──→ [Show Progress]
           |
           v
[Upload Complete] ──→ [Success Message]
           |
           v
[Upload More?] ──→ [Select More Files]
```

---

## What Guests Cannot Do

- View the gallery or existing media
- Download media
- Delete media (including their own uploads)
- Access photographer dashboard
- See other guests' uploads
- Generate new links
- Access deactivated upload links

---

## Upload Page Layout

```
┌─────────────────────────────────────────────────┐
│                                                 │
│            John & Jane Wedding                  │
│               June 15, 2024                     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│     Share your photos and videos from the       │
│     event! Drag files here or click to browse.  │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │       Drop files here or click          │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  Upload Queue                                   │
│  ┌─────────────────────────────────────────┐   │
│  │ IMG_001.jpg  2.4MB  ████████░░ 80%   X │   │
│  │ VID_002.mp4  45MB   Waiting...       X │   │
│  │ IMG_003.jpg  1.8MB  Waiting...       X │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```
