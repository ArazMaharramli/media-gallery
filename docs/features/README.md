# Features

Feature specifications organized by user persona.

---

## Personas

| Persona | Description |
|---------|-------------|
| [Photographer](./photographer/) | Creates and manages events |
| [Guest](./guest/) | Accesses event via shared link (view/upload/delete based on permissions) |

**Note:** "Client" is now unified under "Guest" with view-only permissions.

---

## Permissions Matrix

| Action | Photographer | Guest (canView) | Guest (canUpload) | Guest (canDelete) |
|--------|:------------:|:---------------:|:-----------------:|:-----------------:|
| Create event | Yes | - | - | - |
| View dashboard | Yes | - | - | - |
| Upload media | Yes | - | Yes | - |
| View gallery | Yes | Yes | - | - |
| Download media | Yes | Yes | - | - |
| Delete own uploads | Yes | - | Yes* | Yes* |
| Delete shared media | Yes | - | - | Yes |
| Generate links | Yes | - | - | - |
| Revoke links | Yes | - | - | - |

*Guests can always delete media they uploaded themselves, regardless of `canDelete` permission.

---

## Guest Link Permissions

Guest links use a unified `GuestToken` model with permission flags:

```typescript
interface GuestToken {
  id: string
  eventId: string
  token: string
  name: string | null      // Optional label
  active: boolean
  canView: boolean         // View and download media
  canUpload: boolean       // Upload new media
  canDelete: boolean       // Delete shared media
  mediaIds: string[]       // Selective sharing (empty = all media)
  expiresAt: Date | null   // Optional expiration
  createdAt: Date
}
```

### Common Permission Combinations

| Use Case | canView | canUpload | canDelete | mediaIds |
|----------|:-------:|:---------:|:---------:|:--------:|
| Share gallery | Yes | No | No | [] |
| Selective share | Yes | No | No | [ids] |
| Request uploads | No | Yes | No | [] |
| Full collaboration | Yes | Yes | Yes | [] |
