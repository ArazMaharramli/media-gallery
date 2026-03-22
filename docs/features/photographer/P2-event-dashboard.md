# P2: Event Dashboard

**Description:** Central hub for managing an event.

**Entry Point:** After creating event, or via direct URL

---

## Acceptance Criteria

- [ ] Dashboard displays event name, date, and description
- [ ] Dashboard shows all uploaded media in a grid
- [ ] Dashboard has "Share" button to generate view links
- [ ] Dashboard has "Request Upload" button to generate upload links
- [ ] Dashboard shows list of generated upload tokens with status
- [ ] Upload tokens can be deactivated from dashboard
- [ ] Dashboard has upload zone for adding new media

---

## UI Elements

- Event header (name, date, description)
- Media grid component
- Share button
- Request Upload button
- Upload tokens list with deactivate option
- Upload zone (drag & drop)

---

## API

`GET /api/events/:id`

---

## Page

`/event/:id`
