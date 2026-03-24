# Guest Features

Guests receive a guest link from the photographer to access event media and/or upload their own photos and videos.

---

## Overview

Guests can (depending on permissions):
- Access the guest page via shared link or QR code scan
- View the event gallery (if `canView` permission)
- Upload photos and videos (if `canUpload` permission)
- Delete media (if `canDelete` permission or own uploads)
- See upload progress with queue management
- Cancel pending uploads
- Retry failed uploads
- Always see their own uploads (regardless of view permission)

---

## Features

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| [G1](./G1-access-upload-page.md) | Access Guest Page | Open guest page via shared link or QR code | High |
| [G2](./G2-upload-media.md) | Upload Media | Upload photos and videos | High |
| [G3](./G3-upload-progress.md) | Upload Progress | See progress of uploads | High |
| [G4](./G4-cancel-upload.md) | Cancel Upload | Cancel pending uploads | Medium |

---

## User Journey

```
[Receive Link from Photographer]
           |
           v
[Click Link / Scan QR] ──→ [Invalid/Expired?] ──→ [404 Page]
           |
           v
[Guest Page /guest/:token]
           |
           ├── [Has canView OR own uploads?]
           |         |
           |         v
           |   [Gallery Tab] ──→ [Browse Media]
           |         |              |
           |         |              v
           |         |        [View/Download]
           |         |              |
           |         |              v
           |         |        [Delete (if permitted)]
           |
           └── [Has canUpload?]
                     |
                     v
               [Upload Tab] ──→ [Drag & Drop / Click to Upload]
                     |              |
                     |              v
                     |        [Files Added to Queue]
                     |              |
                     |              v
                     |        [Upload Complete]
                     |              |
                     |              v
                     |        [Media Added to Own Uploads]
                     |
                     └── [QR Code Section (Desktop)]
                              |
                              v
                        [Scan with Phone]
                              |
                              v
                        [Upload from Mobile]
```

---

## Permission-Based Access

| Permission | Gallery Tab | Upload Tab | Delete Own | Delete Others |
|------------|-------------|------------|------------|---------------|
| `canView` only | Yes (all media) | No | N/A | No |
| `canUpload` only | Yes (own uploads only) | Yes | Yes | No |
| `canView + canUpload` | Yes (all media) | Yes | Yes | No |
| `canView + canDelete` | Yes (all media) | No | N/A | Yes |
| All permissions | Yes (all media) | Yes | Yes | Yes |

---

## Guest Page Layout

### With Both View and Upload Permissions

```
┌─────────────────────────────────────────────────────────────┐
│                     John & Jane Wedding                      │
│                       June 15, 2024                          │
│        Welcome, Uncle Bob!                                   │
├─────────────────────────────────────────────────────────────┤
│  [Gallery (24)]              [Upload]                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  (Content based on selected tab)                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Upload Tab Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────┐  │  ┌───────────────┐ │
│  │                                 │  │  │               │ │
│  │   Click to upload or drag      │  │  │   [QR CODE]   │ │
│  │   and drop                     │  │  │               │ │
│  │                                 │  │  └───────────────┘ │
│  │   JPG, PNG, GIF, WEBP,         │  │                     │
│  │   MP4, MOV, WEBM up to 500MB   │  │  Scan to upload     │
│  │                                 │  │  from mobile        │
│  └─────────────────────────────────┘  │                     │
│                                       │  [  Copy Link  ]    │
│  Upload Queue (2 files)               │                     │
│  ┌─────────────────────────────────┐  │                     │
│  │ 🖼 IMG_001.jpg  2.4MB  ████ 80% X │                     │
│  │ 🎬 VID_002.mp4  45MB  Waiting... │                     │
│  │ 🖼 IMG_003.jpg  1.8MB  ✓         │                     │
│  └─────────────────────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Upload Tab Layout (Mobile)

```
┌─────────────────────────────────┐
│                                 │
│   Click to upload or drag       │
│   and drop                      │
│                                 │
│   JPG, PNG, GIF, WEBP,          │
│   MP4, MOV, WEBM up to 500MB    │
│                                 │
└─────────────────────────────────┘

Upload Queue (2 files)
┌─────────────────────────────────┐
│ 🖼 IMG_001.jpg  2.4MB  ███ 80% X│
│ 🎬 VID_002.mp4  45MB  Waiting...│
└─────────────────────────────────┘
```

---

## Upload Queue Features

| Element | Description |
|---------|-------------|
| File icon | Blue for images, purple for videos |
| Filename | Truncated if too long |
| File size | Formatted (KB/MB) |
| Progress bar | Blue during upload, shows percentage |
| Status | "Waiting...", progress %, checkmark, or error |
| Cancel button | Abort upload in progress |
| Retry button | Retry failed uploads |
| Remove button | Remove failed items from queue |
| Clear completed | Button to remove all completed items |

---

## What Guests Cannot Do

- Access photographer dashboard
- Generate new links
- Access deactivated/expired links
- View media without `canView` permission (except own uploads)
- Delete media without `canDelete` permission (except own uploads)
