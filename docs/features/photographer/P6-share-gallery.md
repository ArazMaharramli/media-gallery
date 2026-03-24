# P6: Share Gallery

**Description:** Generate shareable guest links with customizable permissions.

**Entry Point:** Dashboard "Share" dropdown button

---

## Acceptance Criteria

### Quick Share
- [ ] Click "Share" dropdown shows two options
- [ ] "Share" option creates view-only link instantly
- [ ] Link copied to clipboard immediately
- [ ] Toast notification confirms "Share link created and copied"
- [ ] Share modal displays the generated link

### Share with Permissions
- [ ] "Share with permissions" opens modal
- [ ] Modal allows setting:
  - Link name (optional, for identification)
  - Can view and download media (checkbox)
  - Can upload new media (checkbox)
  - Can delete shared media (checkbox)
- [ ] Note displayed: "Guests can always delete media they uploaded themselves"
- [ ] At least one permission (view or upload) must be enabled
- [ ] "Create Link" generates token and copies to clipboard

### Selection Mode
- [ ] When media is selected, Share button shows count: "Share (X Selected)"
- [ ] Quick share with selection creates selective sharing link
- [ ] Only selected media visible to guest via that link

---

## URL Format

`https://gallery.example.com/guest/{guestToken}`

---

## API

**Create Guest Token:**
`POST /api/events/:id/guest-tokens`

Request body:
```json
{
  "name": "Uncle Bob",
  "canView": true,
  "canUpload": false,
  "canDelete": false,
  "mediaIds": ["uuid1", "uuid2"]  // Optional: for selective sharing
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "token": "xK9mN2pQ4rS6tU8v",
    "name": "Uncle Bob",
    "canView": true,
    "canUpload": false,
    "canDelete": false,
    "mediaIds": [],
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## UI Components

- Share dropdown button (in EventHeader)
  - "Share" - quick view-only link
  - "Share with permissions" - opens modal
- CreateGuestTokenModal
  - Name input (optional)
  - Permission checkboxes
  - Selective sharing indicator
- ShareModal (shows generated link)

---

## Notes

- Multiple guest tokens can exist per event
- Each token can have different permissions
- Tokens are active by default
- Revoked tokens return 404 to guests
