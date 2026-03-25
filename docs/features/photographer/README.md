# Photographer Features

The photographer is the primary user who creates and manages events.

---

## Overview

Photographers can:
- Create events with name, date, and description
- Upload photos and videos
- View and manage uploaded media
- Approve or reject guest uploads before they appear in the gallery
- Generate shareable guest links with customizable permissions
- Revoke guest links to prevent access
- Delete media

---

## Features

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| [P1](./P1-create-event.md) | Create Event | Create new event with name, date, description | High |
| [P2](./P2-event-dashboard.md) | Event Dashboard | Central hub for managing event | High |
| [P3](./P3-upload-media.md) | Upload Media | Upload photos and videos | High |
| [P4](./P4-view-media.md) | View Media | Lightbox and video player | High |
| [P5](./P5-delete-media.md) | Delete Media | Remove uploaded media | Medium |
| [P6](./P6-share-gallery.md) | Share Gallery | Generate guest links with permissions | High |
| [P8](./P8-deactivate-upload-link.md) | Revoke Guest Link | Disable guest links | Low |
| [P9](./P9-media-approval.md) | Media Approval | Review and approve guest uploads | High |

---

## Guest Links

Guest links are unified access tokens that can have any combination of permissions:

| Permission | Description |
|------------|-------------|
| `canView` | View and download media |
| `canUpload` | Upload new media |
| `canDelete` | Delete shared media (guests can always delete their own uploads) |

### Creating Guest Links

**Quick Share:**
- Click "Share" dropdown → "Share"
- Creates view-only link instantly
- Link copied to clipboard

**Share with Permissions:**
- Click "Share" dropdown → "Share with permissions"
- Set custom permissions
- Optionally name the link
- Select specific media (selective sharing)

### Managing Guest Links

- View active links in the "Links" tab
- Copy link to clipboard
- Revoke to disable access

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
     ├── [Media Tab] → [View in Grid] → [Lightbox/Player]
     |
     ├── [Upload Tab] → [Upload Media]
     |
     ├── [Links Tab] → [View/Copy/Revoke Links]
     |
     └── [Share Button] → [Quick Share] or [Share with Permissions]
                              |
                              v
                    [Guest receives link] → /guest/{token}
```
