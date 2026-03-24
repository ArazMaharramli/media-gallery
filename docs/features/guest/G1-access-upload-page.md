# G1: Access Guest Page

**Description:** Access the guest page via shared link or QR code scan.

**Entry Point:** Guest link (e.g., `/guest/aB3cD5eF7gH9iJ1k`) or QR code scan

---

## Acceptance Criteria

- [x] Guest page accessible via guest token URL (`/guest/:token`)
- [x] Invalid tokens show 404 page
- [x] Deactivated tokens show 404 page
- [x] Expired tokens show 404 page
- [x] No authentication required
- [x] Event name and date displayed
- [x] Token name displayed if set (e.g., "Welcome, Uncle Bob!")
- [x] Tab bar shows available tabs based on permissions
- [x] Gallery tab visible if `canView` OR guest has own uploads
- [x] Upload tab visible if `canUpload`
- [x] QR code displayed in upload tab (desktop only)
- [x] QR code enables easy mobile upload from phone camera
- [x] Copy link button available in QR code section

---

## UI Elements

- Event name header
- Event date
- Welcome message with token name (if set)
- Tab navigation (Gallery | Upload) - based on permissions
- Gallery view (grid/list toggle)
- Upload dropzone
- QR code display (in Upload tab, desktop only)
- Copy link button

---

## Tab Visibility Logic

| Condition | Gallery Tab | Upload Tab |
|-----------|-------------|------------|
| `canView: true` | Visible | Hidden |
| `canUpload: true` | Hidden* | Visible |
| `canView: true, canUpload: true` | Visible | Visible |
| Has own uploads (any permission) | Visible | Based on `canUpload` |

*If guest has `canUpload` only, Gallery tab becomes visible once they upload media

---

## QR Code Feature

- QR code encodes full guest URL
- Displayed in Upload tab on desktop (hidden on mobile)
- Guests can scan with phone camera to open upload page on mobile
- Useful for events where guests want to upload directly from phone
- Link can also be copied via "Copy Link" button

---

## API

**Get Guest Access Info:**
`GET /api/guest/:token`

Response:
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "...",
      "name": "John & Jane Wedding",
      "description": "...",
      "date": "2024-06-15"
    },
    "permissions": {
      "canView": true,
      "canUpload": true,
      "canDelete": false
    },
    "tokenId": "...",
    "tokenName": "Uncle Bob",
    "media": [...],
    "ownUploads": [...]
  }
}
```

---

## Page

`/guest/:token`
