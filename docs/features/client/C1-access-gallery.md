# C1: Access Gallery

**Description:** Access the event gallery via shared link.

**Entry Point:** Shared view link (e.g., `/gallery/xK9mN2pQ4rS6tU8v`)

---

## Acceptance Criteria

- [ ] Gallery accessible via view token URL
- [ ] Invalid tokens show 404 page
- [ ] No authentication required
- [ ] Event name, date, and description displayed
- [ ] Media grid shows all photos and videos

---

## UI Elements

- Event header (name, date, description)
- Media count summary
- Media grid

---

## API

`GET /api/gallery/:token`

---

## Page

`/gallery/:token`
