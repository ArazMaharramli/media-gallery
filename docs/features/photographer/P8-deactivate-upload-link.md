# P8: Revoke Guest Link

**Description:** Revoke a guest link so recipients can no longer access the event.

**Entry Point:** Dashboard "Links" tab

---

## Acceptance Criteria

- [ ] Links tab shows all active guest links
- [ ] Each link displays:
  - Name (if set)
  - Token string
  - Permission badges (View, Upload, Delete)
  - Media count (for selective sharing)
  - Creation date
  - Expiration date (if set)
- [ ] "Copy" button copies link to clipboard
- [ ] "Revoke" button disables the link
- [ ] Revoked links are removed from the active list
- [ ] Revoked tokens return 404 on guest access
- [ ] Cannot be reactivated

---

## UI Elements

- Links tab (in main tab bar)
  - Badge showing active link count
- GuestTokenList component
  - Token display with name
  - Permission badges
  - Copy button
  - Revoke button
- Empty state when no active links

---

## API

**List Guest Tokens:**
`GET /api/events/:id/guest-tokens`

**Revoke Guest Token:**
`PATCH /api/events/:id/guest-tokens/:tokenId/revoke`

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "active": false
  }
}
```

---

## Notes

- Revoking a link does not delete uploaded media
- Media uploaded via the revoked link remains in the gallery
- Photographers can create new links at any time
