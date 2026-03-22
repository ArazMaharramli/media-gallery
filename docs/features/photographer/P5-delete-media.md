# P5: Delete Media

**Description:** Remove uploaded media from event.

**Entry Point:** Dashboard media grid

---

## Acceptance Criteria

- [ ] Delete option available on media item
- [ ] Confirmation prompt before deletion
- [ ] File is removed from storage (MinIO)
- [ ] Database record is deleted
- [ ] UI updates immediately after deletion
- [ ] Guest uploads can also be deleted

---

## API

`DELETE /api/media/:id`
