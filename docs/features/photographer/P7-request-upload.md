# P7: Request Upload (Deprecated)

> **Note:** This feature has been merged into [P6: Share Gallery](./P6-share-gallery.md).
>
> Upload links are now created using the unified "Share with permissions" feature by enabling the "Can upload new media" permission.

---

## Migration

The old upload token system has been replaced with unified guest tokens:

| Old Way | New Way |
|---------|---------|
| `/upload/{token}` | `/guest/{token}` |
| Separate "Request Upload" button | "Share with permissions" → enable upload |
| Upload-only tokens | Any permission combination |

See [P6: Share Gallery](./P6-share-gallery.md) for the current implementation.
