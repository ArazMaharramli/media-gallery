# G1: Access Upload Page

**Description:** Access the upload page via shared link.

**Entry Point:** Shared upload link (e.g., `/upload/aB3cD5eF7gH9iJ1k`)

---

## Acceptance Criteria

- [ ] Upload page accessible via upload token URL
- [ ] Invalid tokens show 404 page
- [ ] Deactivated tokens show 404 page
- [ ] No authentication required
- [ ] Event name displayed (so guest knows which event)
- [ ] Clear upload instructions shown

---

## UI Elements

- Event name header
- Upload instructions
- Upload zone

---

## API

Token validated when uploading via `POST /api/upload/guest/:token`

---

## Page

`/upload/:token`
