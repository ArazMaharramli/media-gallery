# P7: Request Upload

**Description:** Generate shareable links for guests to upload media.

**Entry Point:** Dashboard "Request Upload" button

---

## Acceptance Criteria

- [ ] Click "Request Upload" generates new upload token
- [ ] URL format: `/upload/{uploadToken}`
- [ ] Multiple upload tokens can exist per event
- [ ] Token copied to clipboard immediately
- [ ] Toast notification confirms copy
- [ ] List of upload tokens visible on dashboard
- [ ] Each token shows: truncated token, created date, status

---

## API

`POST /api/events/:id/request-upload`

---

## Generated URL

`https://gallery.example.com/upload/aB3cD5eF7gH9iJ1k`
