# P9: Media Approval Workflow

Guest uploads require photographer approval before appearing in the shared gallery.

---

## Overview

When guests upload media through an upload link, the media enters a **pending** state. The photographer must review and approve these uploads before they become visible to other guests. This ensures quality control over the shared gallery content.

---

## Approval Status

Each media item has an `approvalStatus` field with three possible values:

| Status | Description | Visibility |
|--------|-------------|------------|
| `pending` | Awaiting photographer review | Visible only to uploader and photographer |
| `approved` | Accepted by photographer | Visible to all guests with view permission |
| `rejected` | Declined by photographer | Not visible (media is deleted) |

---

## Automatic Status Assignment

| Upload Source | Initial Status |
|---------------|----------------|
| Photographer | `approved` (auto-approved) |
| Guest | `pending` (requires approval) |

---

## Photographer Workflow

### Viewing Pending Media

1. Navigate to event dashboard
2. Go to **Media** tab
3. Use the **Status Filter** dropdown to filter by:
   - **All Media** - Shows all items regardless of status
   - **Approved** - Shows only approved items
   - **Pending** - Shows items awaiting approval
   - **Rejected** - Shows rejected items (if any remain)

### Status Badges

Media items display colored badges indicating their status:

| Status | Badge Color | Display |
|--------|-------------|---------|
| Pending | Amber/Orange | "Pending" |
| Rejected | Red | "Rejected" |
| Approved | No badge | Clean appearance |

Badges appear in both **grid view** and **list view**.

### Approving Media

**From Grid View:**
1. Hover over a pending media item
2. Click the green checkmark button
3. Media is instantly approved

**From List View:**
1. Locate the pending item (shows "Pending" badge)
2. Click the green checkmark button on the right
3. Media is instantly approved

### Rejecting Media

**From Grid View:**
1. Hover over a pending media item
2. Click the red X button
3. Media is rejected and removed

**From List View:**
1. Locate the pending item
2. Click the red X button on the right
3. Media is rejected and removed

---

## Guest Experience

### Own Uploads

Guests can **always** see their own uploads regardless of approval status:
- Pending uploads show with "Pending" badge
- Approved uploads appear normally
- Rejected uploads are removed

### Other Guests' Uploads

Guests can only see media from other guests that has been **approved** by the photographer.

---

## API Endpoints

### Approve Media

```
POST /api/media/{id}/approve
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Media approved"
  }
}
```

### Reject Media

```
POST /api/media/{id}/reject
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Media rejected"
  }
}
```

### Get Media with Status Filter

```
GET /api/events/{id}/media?status={status}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `all`, `pending`, `approved`, `rejected` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response includes:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": { ... },
    "pendingCount": 5
  }
}
```

The `pendingCount` is always returned regardless of current filter, allowing the UI to show pending notification badges.

---

## Database Schema

### ApprovalStatus Enum

```prisma
enum ApprovalStatus {
  pending
  approved
  rejected
}
```

### Media Model Update

```prisma
model Media {
  // ... existing fields
  approvalStatus ApprovalStatus @default(approved)

  @@index([approvalStatus])
}
```

---

## UI Components

### Status Filter (EventMediaGrid)

Located in the Media tab toolbar:
- Dropdown with options: All Media, Approved, Pending (count), Rejected
- Pending option shows count of pending items when > 0
- Filter persists while browsing

### Status Badge (MediaCard)

- Displayed on top-right corner of media thumbnails
- Only shows for `pending` and `rejected` status
- Approved items have no badge (clean look)

### Approval Actions

Approval/reject buttons appear:
- On hover in grid view
- Always visible in list view
- Only for items with `pending` status
- Disabled during API call (shows spinner)

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Filter to "Pending" with no pending items | Empty state shown, tab stays visible |
| Approve last pending item | Stays on current filter, shows empty state |
| Reject media | Media is deleted from storage and database |
| Guest views gallery | Only sees approved media + own uploads |

---

## Related Features

- [P3: Upload Media](./P3-upload-media.md) - Photographer uploads (auto-approved)
- [G2: Guest Upload](../guest/G2-upload-media.md) - Guest uploads (pending approval)
- [P5: Delete Media](./P5-delete-media.md) - Manual deletion
