# User Flows

This document describes the detailed user journeys for all user types.

## 1. Photographer Flow

The photographer is the primary user who creates events and manages media.

### 1.1 Create Event

```
START
  |
  v
[Visit Home Page]
  |
  v
[Fill Event Form]
  - Event name (required)
  - Event date (required, date picker)
  - Description (optional)
  |
  v
[Click "Create Event"]
  |
  v
[System generates:]
  - Unique event ID
  - (No tokens yet - generated on demand)
  |
  v
[Redirect to Event Dashboard]
  |
  v
END
```

### 1.2 Upload Media

```
START
  |
  v
[On Event Dashboard]
  |
  v
[Click Upload tab or drag files]
  |
  v
[Select files from device]
  - Supported: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM
  - Multiple files allowed
  |
  v
[Files added to upload queue]
  - Queue displayed as list
  - Each item shows: icon, filename, size, status
  |
  v
[Files upload sequentially (one at a time)]
  - Current file shows progress bar with percentage
  - Pending files show "waiting" status
  - Uses full bandwidth for faster uploads
  |
  v
[User can cancel uploads]
  - Cancel pending: removes from queue
  - Cancel in-progress: aborts upload
  |
  v
[Upload complete]
  - File added to media grid
  - Next file in queue starts
  |
  v
END
```

### 1.3 Manage Media

```
START
  |
  v
[View media grid on Media tab]
  |
  v
[Click on media item]
  |
  v
[Options:]
  - View in lightbox
  - Download
  - Delete
  |
  v
[If Delete:]
  - Confirmation prompt
  - File removed from storage
  - Entry removed from database
  |
  v
END
```

### 1.4 Share Links

#### Quick Share (View-Only)

```
START
  |
  v
[On Event Dashboard]
  |
  v
[Click "Share" dropdown]
  |
  v
[Click "Share"]
  |
  v
[System generates guest token with canView: true]
  - Token saved to database
  |
  v
[Link copied to clipboard]
  - Format: /guest/{newToken}
  - Toast: "Share link created and copied"
  |
  v
[Share modal displays link]
  |
  v
[Send link to recipient]
  |
  v
END
```

#### Share with Permissions

```
START
  |
  v
[On Event Dashboard]
  |
  v
[Click "Share" dropdown]
  |
  v
[Click "Share with permissions"]
  |
  v
[Modal opens with options:]
  - Link name (optional)
  - Can view and download (checkbox)
  - Can upload new media (checkbox)
  - Can delete shared media (checkbox)
  |
  v
[Click "Create Link"]
  |
  v
[System generates guest token with selected permissions]
  |
  v
[Link copied to clipboard]
  - Format: /guest/{newToken}
  - Toast: "Guest link created and copied"
  |
  v
END
```

#### Selective Sharing

```
START
  |
  v
[On Event Dashboard, Media tab]
  |
  v
[Enter selection mode]
  |
  v
[Select specific media items]
  |
  v
[Share button shows: "Share (X Selected)"]
  |
  v
[Click "Share" or "Share with permissions"]
  |
  v
[Token created with mediaIds[] restriction]
  - Only selected media visible to guest
  |
  v
END
```

#### Revoke Guest Link

```
START
  |
  v
[On Event Dashboard]
  |
  v
[Click "Links" tab]
  |
  v
[View list of active guest links]
  - Shows: name, token, permissions, date
  |
  v
[Click "Revoke" on a token]
  |
  v
[Token marked as inactive]
  - Link removed from active list
  - Guests with this link see 404
  - Existing uploads not affected
  |
  v
END
```

---

## 2. Guest Flow

Guests receive a link from the photographer to access the event.

### 2.1 Access Guest Page

```
START
  |
  v
[Click shared guest link]
  |
  v
[System validates token]
  |
  +---> [Invalid] --> [Show 404 page]
  |
  +---> [Revoked] --> [Show 404 page]
  |
  +---> [Expired] --> [Show 404 page]
  |
  v
[Valid & Active] --> [Load guest page]
  |
  v
[Display based on permissions:]
  - canView: Show gallery with media grid
  - canUpload: Show upload tab/zone
  - Both: Show tab bar to switch
  |
  v
END
```

### 2.2 View Gallery (if canView)

```
START
  |
  v
[On Guest Page with canView]
  |
  v
[Display:]
  - Event name, date & description
  - Media grid (photos & videos)
  - If mediaIds restricted: only those items
  |
  v
[Scroll through media grid]
  - Thumbnails displayed
  - View mode toggle (grid/list)
  |
  v
[Click on photo]
  |
  v
[Open lightbox view]
  - Full-size image
  - Navigation arrows (prev/next)
  - Close button
  - Download button
  - Delete button (if canDelete or own upload)
  |
  v
[Click on video]
  |
  v
[Open video player]
  - Play/pause controls
  - Progress bar
  - Download button
  - Delete button (if canDelete or own upload)
  |
  v
END
```

### 2.3 Upload Media (if canUpload)

```
START
  |
  v
[On Guest Page with canUpload]
  |
  v
[Click upload zone or drag files]
  |
  v
[Select files from device]
  - Supported: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM
  - Multiple files allowed
  |
  v
[Files upload with progress indicator]
  - Media marked with guestTokenId
  |
  v
[Upload complete]
  - Success message displayed
  - If canView: media appears in gallery
  |
  v
END
```

### 2.4 Delete Media

```
START
  |
  v
[On Guest Page]
  |
  v
[Click delete button on media]
  |
  v
[System checks permission:]
  |
  +---> [Own upload (guestTokenId matches)] --> [Allow delete]
  |
  +---> [Shared media + canDelete: true] --> [Allow delete]
  |
  +---> [Shared media + canDelete: false] --> [Show error]
  |
  v
[If allowed:]
  - Confirmation prompt
  - Media deleted
  - Removed from view
  |
  v
END
```

### 2.5 Download Media (if canView)

```
START
  |
  v
[In lightbox/video player]
  |
  v
[Click download button]
  |
  v
[Browser downloads original file]
  - Original filename preserved
  - Full resolution (no compression)
  |
  v
END
```

---

## User Flow Diagram (Overview)

```
                    +-----------------+
                    |   Photographer  |
                    +-----------------+
                            |
              +-------------+-------------+
              |                           |
              v                           v
      [Create Event]              [Upload Media]
              |                           |
              v                           v
    [Event Dashboard]             [Manage Media]
              |
              v
   [Share Dropdown] ──────────────────────────┐
              |                                |
    +---------+---------+                      |
    |                   |                      |
    v                   v                      |
[Quick Share]   [Share with Perms]             |
    |                   |                      |
    +--------+----------+                      |
             |                                 |
             v                                 |
    [Guest Link Created] ─────────────────────>|
             |                                 |
             v                                 |
    +-----------------+                        |
    |     Guest       |                        |
    +-----------------+                        |
             |                                 |
    +--------+--------+                        |
    |        |        |                        |
    v        v        v                        |
 [View]  [Upload] [Delete]                     |
    |        |        |                        |
    v        |        |                        |
[Download]   |        |                        |
             |        |                        |
             +--------+------------------------+
                      |
                      v
              [Links Tab: Revoke]
```
