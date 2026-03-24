# G5: Infinite Scroll

**Description:** Gallery loads more media automatically as the user scrolls down.

**Entry Point:** Guest gallery tab

---

## Acceptance Criteria

- [x] Initial page load fetches first 20 items
- [x] Intersection Observer detects when user scrolls near bottom
- [x] Automatically fetches next page when trigger is visible
- [x] Loading indicator shown while fetching
- [x] New media appended to existing list (no flicker)
- [x] Stops fetching when all items loaded
- [x] Shows total count when all items displayed
- [x] Works in both grid and list view modes

---

## Implementation Details

### Intersection Observer Setup

```typescript
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && hasMoreMedia && !isLoadingMore) {
      loadMoreMedia()
    }
  },
  { rootMargin: '100px' }  // Start loading 100px before reaching bottom
)

observer.observe(loadMoreTrigger)
```

### State Management

| State | Type | Description |
|-------|------|-------------|
| `currentPage` | number | Current page number (1-indexed) |
| `totalMediaCount` | number | Total items available from server |
| `hasMoreMedia` | boolean | Whether more pages exist |
| `isLoadingMore` | boolean | Currently fetching more items |
| `sharedMediaList` | Media[] | Accumulated media items |

### Load More Function

```typescript
async function loadMoreMedia() {
  if (isLoadingMore || !hasMoreMedia) return

  isLoadingMore = true
  const nextPage = currentPage + 1

  const response = await $fetch(`/api/guest/${token}`, {
    params: { page: nextPage, limit: 20 }
  })

  // Append new items to existing list
  sharedMediaList = [...sharedMediaList, ...response.data.media]

  // Update pagination state
  currentPage = response.data.pagination.page
  hasMoreMedia = response.data.pagination.hasMore
  totalMediaCount = response.data.pagination.total

  isLoadingMore = false
}
```

---

## UI States

| State | Visual |
|-------|--------|
| Loading more | Spinner with "Loading more..." text |
| All loaded | "X items total" text |
| Empty gallery | "No media in this gallery yet" |

---

## API

Uses existing guest endpoint with pagination:

`GET /api/guest/:token?page=2&limit=20`

Response includes `pagination` object:
```json
{
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

## Performance Considerations

- **Root margin**: 100px buffer prevents loading delay
- **Debouncing**: `isLoadingMore` flag prevents duplicate requests
- **Append only**: New items added to array, no re-render of existing
- **Own uploads separate**: Guest's own uploads not paginated (always loaded fully)

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Very fast scroll | Single request due to `isLoadingMore` flag |
| Network error | Stops loading, can retry on next scroll |
| Tab switch during load | Continues loading in background |
| Upload while viewing | New upload added to own uploads list immediately |
