# P8: Deactivate Upload Link

**Description:** Disable an upload link so guests can no longer use it.

**Entry Point:** Dashboard upload tokens list

---

## Acceptance Criteria

- [ ] "Deactivate" button on each active token
- [ ] Confirmation prompt before deactivation
- [ ] Deactivated tokens show "Inactive" status
- [ ] Deactivated tokens return 404 on guest access
- [ ] Cannot be reactivated

---

## API

`PATCH /api/upload-tokens/:id/deactivate`
