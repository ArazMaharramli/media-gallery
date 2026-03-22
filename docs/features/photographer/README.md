# Photographer Features

The photographer is the primary user who creates and manages events.

---

## Overview

Photographers can:
- Create events with name, date, and description
- Upload photos and videos
- View and manage uploaded media
- Generate shareable view links for clients
- Generate upload request links for guests
- Delete media
- Deactivate upload links

---

## Features

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| [P1](./P1-create-event.md) | Create Event | Create new event with name, date, description | High |
| [P2](./P2-event-dashboard.md) | Event Dashboard | Central hub for managing event | High |
| [P3](./P3-upload-media.md) | Upload Media | Upload photos and videos | High |
| [P4](./P4-view-media.md) | View Media | Lightbox and video player | High |
| [P5](./P5-delete-media.md) | Delete Media | Remove uploaded media | Medium |
| [P6](./P6-share-gallery.md) | Share Gallery | Generate view links for clients | High |
| [P7](./P7-request-upload.md) | Request Upload | Generate upload links for guests | Medium |
| [P8](./P8-deactivate-upload-link.md) | Deactivate Upload Link | Disable upload links | Low |

---

## User Journey

```
[Home Page]
     |
     v
[Create Event] ──────────────────────────────────────┐
     |                                                |
     v                                                |
[Event Dashboard] ←───────────────────────────────────┘
     |
     ├── [Upload Media] → [View in Grid]
     |
     ├── [Click Media] → [Lightbox/Player] → [Download]
     |
     ├── [Delete Media] → [Confirm] → [Remove]
     |
     ├── [Share] → [Copy Link] → [Send to Client]
     |
     └── [Request Upload] → [Copy Link] → [Send to Guest]
              |
              └── [Deactivate] → [Link Disabled]
```
