# C1: Access Gallery (Guest View)

**Description:** Access the event gallery via shared guest link.

**Entry Point:** Shared guest link (e.g., `/guest/xK9mN2pQ4rS6tU8v`)

---

## Acceptance Criteria

- [ ] Gallery accessible via guest token URL
- [ ] Invalid/revoked tokens show 404 page
- [ ] No authentication required
- [ ] Event name, date, and description displayed
- [ ] Media grid shows photos and videos based on token permissions:
  - All media (if no mediaIds restriction)
  - Only selected media (if mediaIds specified)
- [ ] View mode toggle (grid/list)
- [ ] Lightbox for viewing photos
- [ ] Video player for videos
- [ ] Download button on each media item

---

## Permission-Based Features

| Permission | Feature |
|------------|---------|
| canView | View media grid, lightbox, download |
| canUpload | Upload tab visible, can upload media |
| canDelete | Delete button visible, can delete shared media |

**Note:** Guests can always delete media they uploaded themselves, regardless of canDelete permission.

---

## UI Elements

- Event header (name, date, description)
- View mode toggle (grid/list)
- Tab bar (Gallery | Upload) - if both permissions
- Media grid with thumbnails
- Lightbox with navigation
- Video player
- Download buttons
- Delete buttons (if permitted)

---

## API

**Get Guest Access:**
`GET /api/guest/:token`

Response:
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "uuid",
      "name": "Wedding",
      "description": "...",
      "date": "2024-01-01"
    },
    "permissions": {
      "canView": true,
      "canUpload": false,
      "canDelete": false
    },
    "tokenId": "uuid",
    "tokenName": "Uncle Bob",
    "media": [...]
  }
}
```

**Delete Media (Guest):**
`DELETE /api/guest/:token/media/:mediaId`

---

## Page

`/guest/:token`
