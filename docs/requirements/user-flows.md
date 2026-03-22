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
[Click Upload Zone or drag files]
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
[View media grid on dashboard]
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

#### Share Gallery (View Link)

```
START
  |
  v
[On Event Dashboard]
  |
  v
[Click "Share" button]
  |
  v
[System generates new view token]
  - Token saved to database
  - Multiple tokens can exist per event
  |
  v
[View link copied to clipboard]
  - Format: /gallery/{newToken}
  - Toast notification confirms copy
  |
  v
[Send link to client via email/messenger]
  |
  v
END
```

#### Request Upload (Upload Link)

```
START
  |
  v
[On Event Dashboard]
  |
  v
[Click "Request Upload" button]
  |
  v
[System generates new upload token]
  - Token saved to database
  - Multiple tokens can exist per event
  - Token is active by default
  |
  v
[Upload link copied to clipboard]
  - Format: /upload/{newToken}
  - Toast notification confirms copy
  |
  v
[Send link to guests via email/messenger]
  |
  v
END
```

#### Deactivate Upload Link

```
START
  |
  v
[On Event Dashboard]
  |
  v
[View list of upload tokens]
  - Shows token, creation date, status
  |
  v
[Click "Deactivate" on a token]
  |
  v
[Confirmation prompt]
  |
  v
[Token marked as inactive]
  - Guests with this link see 404
  - Existing uploads not affected
  |
  v
END
```

---

## 2. Client Flow

Clients receive the view link from the photographer to browse and download media.

### 2.1 Access Gallery

```
START
  |
  v
[Click shared view link]
  |
  v
[System validates token]
  |
  +---> [Invalid] --> [Show 404 page]
  |
  v
[Valid] --> [Load gallery page]
  |
  v
[Display:]
  - Event name, date & description
  - Media grid (photos & videos)
  |
  v
END
```

### 2.2 View Media

```
START
  |
  v
[On Gallery Page]
  |
  v
[Scroll through media grid]
  - Lazy loading for performance
  - Thumbnails displayed
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
  |
  v
[Click on video]
  |
  v
[Open video player]
  - Play/pause controls
  - Progress bar
  - Fullscreen option
  - Download button
  |
  v
END
```

### 2.3 Download Media

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

## 3. Guest Flow

Guests receive the upload link to contribute media from their own devices.

### 3.1 Access Upload Page

```
START
  |
  v
[Click shared upload link]
  |
  v
[System validates upload token]
  |
  +---> [Invalid] --> [Show 404 page]
  |
  +---> [Deactivated] --> [Show 404 page]
  |
  v
[Valid & Active] --> [Load upload page]
  |
  v
[Display:]
  - Event name
  - Upload zone
  - Instructions
  |
  v
END
```

### 3.2 Upload Media

```
START
  |
  v
[On Upload Page]
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
  |
  v
[Upload complete]
  - Success message displayed
  - Option to upload more
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
      [Get Links]                 [Manage Media]
              |
    +---------+---------+
    |                   |
    v                   v
[View Link]       [Upload Link]
    |                   |
    v                   v
+---------+       +---------+
| Client  |       |  Guest  |
+---------+       +---------+
    |                   |
    v                   v
[View Gallery]    [Upload Media]
    |
    v
[Download Files]
```
