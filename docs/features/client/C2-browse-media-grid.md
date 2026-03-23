# C2: Browse Media Grid

**Description:** Browse uploaded media in grid or list view.

**Entry Point:** Gallery page

---

## Acceptance Criteria

- [ ] View toggle allows switching between grid and list views
- [ ] Grid view displays thumbnails in responsive layout
- [ ] List view displays media in rows with details
- [ ] Grid displays video poster frames with duration badge
- [ ] Both views are responsive (adapt to screen size)
- [ ] Lazy loading for performance (load on scroll)
- [ ] Photos and videos are visually distinguishable
- [ ] Item count displayed in toolbar
- [ ] View preference persists during session

---

## UI Elements

### Toolbar
- Item count display
- View toggle buttons (grid/list icons)

### Grid View
- Responsive grid container
- Media thumbnail cards (square aspect ratio)
- Video duration badge (top-right corner)

### List View
- List container with dividers
- Row items with: thumbnail, filename, type icon, file size, duration (videos)
- View and Download action buttons per row

---

## Responsive Breakpoints (Grid View)

| Screen | Columns |
|--------|---------|
| Mobile | 2 |
| Tablet | 3-4 |
| Desktop | 4-5 |

---

## List View Row Layout

```
[Thumbnail] [Filename]              [View] [Download]
            [Type] [Size] [Duration]
```
