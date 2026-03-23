# G1: Access Upload Page

**Description:** Access the upload page via shared link or QR code scan.

**Entry Point:** Shared upload link (e.g., `/upload/aB3cD5eF7gH9iJ1k`) or QR code scan

---

## Acceptance Criteria

- [ ] Upload page accessible via upload token URL
- [ ] Invalid tokens show 404 page
- [ ] Deactivated tokens show 404 page
- [ ] No authentication required
- [ ] Event name displayed (so guest knows which event)
- [ ] Clear upload instructions shown
- [ ] Two tabs: "Upload Here" and "Scan QR Code"
- [ ] QR code tab displays scannable QR code linking to current upload page
- [ ] QR code enables easy mobile upload from phone camera
- [ ] Copy link button available below QR code

---

## UI Elements

- Event name header
- Upload instructions banner
- Tab navigation (Upload Here / Scan QR Code)
- Upload zone (in Upload tab)
- QR code display (in QR tab)
- Copy link input with copy button

---

## QR Code Feature

- QR code encodes full upload URL
- Guests can scan with phone camera to open upload page on mobile
- Useful for events where guests want to upload directly from phone
- Link can also be copied and shared via messaging apps

---

## API

Token validated when uploading via `POST /api/upload/guest/:token`

---

## Page

`/upload/:token`
