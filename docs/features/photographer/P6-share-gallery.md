# P6: Share Gallery

**Description:** Generate shareable links for clients to view the gallery.

**Entry Point:** Dashboard "Share" button

---

## Acceptance Criteria

- [ ] Click "Share" generates new view token
- [ ] URL format: `/gallery/{viewToken}`
- [ ] Multiple view tokens can exist per event
- [ ] Token copied to clipboard immediately
- [ ] Toast notification confirms copy
- [ ] Each token provides access to same gallery

---

## API

`POST /api/events/:id/share`

---

## Generated URL

`https://gallery.example.com/gallery/xK9mN2pQ4rS6tU8v`
