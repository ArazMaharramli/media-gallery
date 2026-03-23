# Guest Features

Guests receive an upload link from the photographer to contribute their own photos and videos.

---

## Overview

Guests can:
- Access upload page via shared upload link or QR code scan
- Upload photos and videos to the event
- See upload progress
- Cancel pending uploads
- Scan QR code to upload from mobile device

---

## Features

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| [G1](./G1-access-upload-page.md) | Access Upload Page | Open upload page via shared link or QR code | High |
| [G2](./G2-upload-media.md) | Upload Media | Upload photos and videos | High |
| [G3](./G3-upload-progress.md) | Upload Progress | See progress of uploads | High |
| [G4](./G4-cancel-upload.md) | Cancel Upload | Cancel pending uploads | Medium |

---

## User Journey

```
[Receive Link from Photographer]
           |
           v
[Click Link / Scan QR] ──→ [Invalid/Deactivated?] ──→ [404 Page]
           |
           v
[Upload Page]
           |
           ├── [Upload Here Tab] ──→ [Select Files]
           |                              |
           |                              v
           |                      [Files Added to Queue]
           |                              |
           |                              v
           |                      [Upload Complete]
           |
           └── [Scan QR Tab] ──→ [Show QR Code]
                                      |
                                      v
                              [Scan with Phone]
                                      |
                                      v
                              [Upload from Mobile]
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
├─────────────────────────────────────────────────┤
│  [Upload Here]          [Scan QR Code]          │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │   (Upload Zone or QR Code depending     │   │
│  │    on selected tab)                     │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Copy Link: https://...]        [Copy Button]  │
│                                                 │
├─────────────────────────────────────────────────┤
│  Upload Queue (visible in Upload Here tab)      │
│  ┌─────────────────────────────────────────┐   │
│  │ IMG_001.jpg  2.4MB  ████████░░ 80%   X │   │
│  │ VID_002.mp4  45MB   Waiting...       X │   │
│  │ IMG_003.jpg  1.8MB  Complete    ✓     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```
