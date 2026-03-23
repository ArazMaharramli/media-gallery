# P7: Request Upload

**Description:** Generate named shareable links for guests to upload media.

**Entry Point:** Dashboard "Upload Links" button (collapsible panel)

---

## Acceptance Criteria

- [ ] "Upload Links" button in dashboard header toggles collapsible panel
- [ ] Panel shows list of existing upload links with names
- [ ] "New Link" button opens modal/form to create new upload token
- [ ] Name input required when creating new link (e.g., "Uncle Bob", "Wedding Party")
- [ ] URL format: `/upload/{uploadToken}`
- [ ] Multiple upload tokens can exist per event
- [ ] Copy button next to each link copies URL to clipboard
- [ ] Toast notification confirms copy
- [ ] Each token shows: name, truncated token, created date, status (active/inactive)
- [ ] Panel includes helper text explaining upload links purpose
- [ ] Media uploaded via token is associated with the token's name

---

## UI Elements

- "Upload Links" toggle button with chevron icon
- Collapsible panel within event header card
- "New Link" button
- New Link form/modal:
  - Name input field (required, max 50 chars)
  - Create button
  - Cancel button
- List of tokens showing:
  - Name (bold)
  - Token (truncated, monospace)
  - Status indicator (green dot = active, gray = inactive)
  - Created date
- Copy link button for each active token
- Deactivate button for active tokens

---

## Upload Link Display

```
┌─────────────────────────────────────────────────────────────┐
│  Upload Links                              [+ New Link]     │
├─────────────────────────────────────────────────────────────┤
│  ● Uncle Bob                                                │
│    abc123def456gh78 · Mar 20, 2024         [Copy] [Deact]  │
├─────────────────────────────────────────────────────────────┤
│  ● Wedding Party                                            │
│    xyz789abc123de45 · Mar 18, 2024         [Copy] [Deact]  │
├─────────────────────────────────────────────────────────────┤
│  ○ Bridesmaids (Inactive)                                   │
│    mno456pqr789st12 · Mar 15, 2024                         │
└─────────────────────────────────────────────────────────────┘
```

---

## New Link Modal

```
┌─────────────────────────────────────┐
│  Create Upload Link            [X]  │
├─────────────────────────────────────┤
│                                     │
│  Name                               │
│  ┌─────────────────────────────┐   │
│  │ e.g., Uncle Bob             │   │
│  └─────────────────────────────┘   │
│                                     │
│  This name will be used to          │
│  identify who uploaded the media.   │
│                                     │
│         [Cancel]  [Create Link]     │
│                                     │
└─────────────────────────────────────┘
```

---

## API

`POST /api/events/:id/upload-tokens`

Request body:
```json
{
  "name": "Uncle Bob"
}
```

Response:
```json
{
  "id": "uuid",
  "token": "aB3cD5eF7gH9iJ1k",
  "name": "Uncle Bob",
  "active": true,
  "createdAt": "2024-03-20T12:00:00Z"
}
```

---

## Generated URL

`https://gallery.example.com/upload/aB3cD5eF7gH9iJ1k`
