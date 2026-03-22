# P1: Create Event

**Description:** Create a new event/gallery to organize media.

**Entry Point:** Home page

---

## Acceptance Criteria

- [ ] Event name is required (1-100 characters)
- [ ] Event date is required (date picker)
- [ ] Description is optional (0-500 characters)
- [ ] System generates unique UUID for the event
- [ ] Event is saved to database with timestamps
- [ ] Photographer is redirected to event dashboard after creation
- [ ] No tokens generated at creation (generated on demand)

---

## UI Elements

- Event name input field
- Date picker
- Description textarea
- "Create Event" button

---

## API

`POST /api/events`

---

## Page

`/` (Home)
