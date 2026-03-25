# Data Model

This document describes the database schema and entity relationships.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│              Event                  │
├─────────────────────────────────────┤
│ id          UUID (PK)               │
│ name        VARCHAR(100)            │
│ description VARCHAR(500)            │
│ date        DATE                    │
│ createdAt   TIMESTAMP               │
│ updatedAt   TIMESTAMP               │
└─────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │ 1:N             │ 1:N
        ▼                 ▼
┌───────────────────┐  ┌─────────────────────────┐
│    GuestToken     │  │         Media           │
├───────────────────┤  ├─────────────────────────┤
│ id      UUID (PK) │  │ id        UUID (PK)     │
│ eventId UUID (FK) │  │ eventId   UUID (FK)     │
│ token   VAR(16)   │  │ guestTokenId UUID (FK)  │
│ name    VAR(50)   │  │ filename  VARCHAR(255)  │
│ active  BOOLEAN   │  │ originalName VARCHAR    │
│ canView BOOLEAN   │  │ mimeType  VARCHAR(100)  │
│ canUpload BOOLEAN │  │ size      BIGINT        │
│ canDelete BOOLEAN │  │ storageKey VARCHAR(500) │
│ mediaIds  UUID[]  │  │ type      ENUM          │
│ expiresAt TS      │  │ uploadedBy ENUM         │
│ createdAt TS      │  │ approvalStatus ENUM     │
└───────────────────┘  │ thumbnail VARCHAR       │
        │              │ thumbnailFallback VAR   │
        │ 1:N          │ preview   VARCHAR       │
        └─────────────►│ previewFallback VARCHAR │
                       │ createdAt TIMESTAMP     │
                       └─────────────────────────┘
```

---

## Entities

### Event

Represents a photographer's event/gallery.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique event identifier |
| `name` | VARCHAR(100) | NOT NULL | Event name (e.g., "John & Jane Wedding") |
| `description` | VARCHAR(500) | NULLABLE | Optional event description |
| `date` | DATE | NOT NULL | Date of the event |
| `createdAt` | TIMESTAMP | NOT NULL, default NOW | Record creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, auto-update | Last modification timestamp |

**Indexes:**
- Primary key on `id`
- Index on `date` (for sorting/filtering)

### GuestToken

Represents a shareable guest access link with configurable permissions. Replaces the previous separate ViewToken and UploadToken models.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique token record identifier |
| `eventId` | UUID | FK → Event.id, NOT NULL | Parent event reference |
| `token` | VARCHAR(16) | UNIQUE, NOT NULL | The shareable token string |
| `name` | VARCHAR(50) | NULLABLE | Name/label for the link (e.g., "Uncle Bob", "Wedding Party") |
| `active` | BOOLEAN | NOT NULL, default TRUE | Whether the token is active |
| `canView` | BOOLEAN | NOT NULL, default TRUE | Permission to view gallery |
| `canUpload` | BOOLEAN | NOT NULL, default FALSE | Permission to upload media |
| `canDelete` | BOOLEAN | NOT NULL, default FALSE | Permission to delete media |
| `mediaIds` | UUID[] | default [] | Selective sharing - specific media IDs (empty = all) |
| `expiresAt` | TIMESTAMP | NULLABLE | Optional expiration date |
| `createdAt` | TIMESTAMP | NOT NULL, default NOW | Token creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `token`
- Foreign key index on `eventId`
- Index on `active` (for filtering active tokens)

**Permission Combinations:**
| canView | canUpload | canDelete | Use Case |
|---------|-----------|-----------|----------|
| true | false | false | View-only gallery sharing |
| false | true | false | Upload-only guest contribution |
| true | true | false | View and upload (common for guests) |
| true | true | true | Full access (trusted guests) |

### Media

Represents an uploaded photo or video with optimized variants.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique media identifier |
| `eventId` | UUID | FK → Event.id, NOT NULL | Parent event reference |
| `guestTokenId` | UUID | FK → GuestToken.id, NULLABLE | Guest token used (null if photographer upload) |
| `filename` | VARCHAR(255) | NOT NULL | Generated filename in storage |
| `originalName` | VARCHAR(255) | NOT NULL | Original filename from upload |
| `mimeType` | VARCHAR(100) | NOT NULL | MIME type (e.g., "image/jpeg") |
| `size` | BIGINT | NOT NULL | File size in bytes |
| `storageKey` | VARCHAR(500) | NOT NULL | Full path in storage |
| `type` | ENUM | NOT NULL | "photo" or "video" |
| `uploadedBy` | ENUM | NOT NULL | "photographer" or "guest" |
| `approvalStatus` | ENUM | NOT NULL, default "approved" | "pending", "approved", or "rejected" |
| `thumbnail` | VARCHAR(255) | NULLABLE | Thumbnail filename (WebP) |
| `thumbnailFallback` | VARCHAR(255) | NULLABLE | Thumbnail fallback (JPEG) |
| `preview` | VARCHAR(255) | NULLABLE | Preview filename (WebP/WebM) |
| `previewFallback` | VARCHAR(255) | NULLABLE | Preview fallback (JPEG/MP4) |
| `createdAt` | TIMESTAMP | NOT NULL, default NOW | Upload timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `eventId`
- Foreign key index on `guestTokenId`
- Index on `createdAt` (for sorting)
- Index on `approvalStatus` (for filtering)

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Event {
  id          String   @id @default(uuid())
  name        String   @db.VarChar(100)
  description String?  @db.VarChar(500)
  date        DateTime @db.Date
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  guestTokens GuestToken[]
  media       Media[]

  @@index([date])
  @@map("events")
}

model GuestToken {
  id        String    @id @default(uuid())
  eventId   String
  token     String    @unique @db.VarChar(16)
  name      String?   @db.VarChar(50)
  active    Boolean   @default(true)
  canView   Boolean   @default(true)
  canUpload Boolean   @default(false)
  canDelete Boolean   @default(false)
  mediaIds  String[]  @default([])
  expiresAt DateTime?
  createdAt DateTime  @default(now())

  event Event   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  media Media[]

  @@index([eventId])
  @@index([active])
  @@map("guest_tokens")
}

model Media {
  id                String         @id @default(uuid())
  eventId           String
  guestTokenId      String?
  filename          String         @db.VarChar(255)
  originalName      String         @db.VarChar(255)
  mimeType          String         @db.VarChar(100)
  size              BigInt
  storageKey        String         @db.VarChar(500)
  type              MediaType
  uploadedBy        UploaderType
  approvalStatus    ApprovalStatus @default(approved)
  thumbnail         String?        @db.VarChar(255)
  thumbnailFallback String?        @db.VarChar(255)
  preview           String?        @db.VarChar(255)
  previewFallback   String?        @db.VarChar(255)
  createdAt         DateTime       @default(now())

  event      Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)
  guestToken GuestToken? @relation(fields: [guestTokenId], references: [id], onDelete: SetNull)

  @@index([eventId])
  @@index([guestTokenId])
  @@index([createdAt])
  @@index([approvalStatus])
  @@map("media")
}

enum MediaType {
  photo
  video
}

enum UploaderType {
  photographer
  guest
}

enum ApprovalStatus {
  pending
  approved
  rejected
}
```

---

## Token Generation

Tokens are used for link-based access control.

### Guest Tokens
- Generated on-demand when photographer creates a guest link
- Multiple tokens can exist per event with different permissions
- Tokens can be deactivated (set `active = false`)
- Tokens can optionally expire (via `expiresAt`)
- Deactivated or expired tokens return 404 on access
- Stored in `GuestToken` table

### Requirements
- 16 characters long
- URL-safe characters only (alphanumeric)
- Cryptographically random
- Unique across all tokens

### Generation Algorithm (Node.js)
```typescript
import { randomBytes } from 'crypto'

function generateToken(): string {
  return randomBytes(12)
    .toString('base64url')
    .slice(0, 16)
}
```

---

## Media Variants

Each uploaded media file generates optimized variants:

### Images
| Variant | Size | Format | Usage |
|---------|------|--------|-------|
| Original | Full size | Original | Downloads |
| Thumbnail | 300px width | WebP + JPEG | Grid view |
| Preview | 1200px width | WebP + JPEG | Lightbox |

### Videos
| Variant | Size | Format | Usage |
|---------|------|--------|-------|
| Original | Full size | Original | Downloads |
| Thumbnail | 300px width | WebP + JPEG | Grid view (frame) |
| Preview | 720p | WebM + MP4 | Playback |

---

## Storage Key Format

Media files are stored with the following key structure:

```
{eventId}/{filename}
```

Variants use suffixes:
```
{eventId}/{uuid}.jpg           # Original
{eventId}/{uuid}_thumb.webp    # Thumbnail (WebP)
{eventId}/{uuid}_thumb.jpg     # Thumbnail (JPEG fallback)
{eventId}/{uuid}_preview.webp  # Preview (WebP)
{eventId}/{uuid}_preview.jpg   # Preview (JPEG fallback)
```

---

## Cascade Behavior

| Action | Behavior |
|--------|----------|
| Delete Event | All related GuestToken records are deleted (CASCADE) |
| Delete Event | All related Media records are deleted (CASCADE) |
| Delete Media | Only the Media record is deleted |
| Delete GuestToken | Media.guestTokenId set to NULL (SET NULL) |
| Deactivate GuestToken | Sets `active = false`, token still exists but returns 404 |

**Note:** Storage cleanup must be handled in application code before database deletion.
