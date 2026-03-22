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
        ┌────────┼────────┐
        │ 1:N    │ 1:N    │ 1:N
        ▼        ▼        ▼
┌───────────────┐ ┌───────────────┐ ┌─────────────────────────┐
│   ViewToken   │ │  UploadToken  │ │         Media           │
├───────────────┤ ├───────────────┤ ├─────────────────────────┤
│ id    UUID(PK)│ │ id    UUID(PK)│ │ id        UUID (PK)     │
│ eventId  UUID │ │ eventId  UUID │ │ eventId   UUID (FK)     │
│ token  VAR(16)│ │ token  VAR(16)│ │ filename  VARCHAR(255)  │
│ createdAt TS  │ │ active BOOLEAN│ │ originalName VARCHAR    │
└───────────────┘ │ createdAt TS  │ │ mimeType  VARCHAR(100)  │
                  └───────────────┘ │ size      BIGINT        │
                                    │ storageKey VARCHAR(500) │
                                    │ type      ENUM          │
                                    │ uploadedBy ENUM         │
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

### ViewToken

Represents a shareable view link token. Multiple tokens can exist per event.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique token record identifier |
| `eventId` | UUID | FK → Event.id, NOT NULL | Parent event reference |
| `token` | VARCHAR(16) | UNIQUE, NOT NULL | The shareable token string |
| `createdAt` | TIMESTAMP | NOT NULL, default NOW | Token creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `token`
- Foreign key index on `eventId`

### UploadToken

Represents a shareable upload link token. Multiple tokens can exist per event. Tokens can be deactivated.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique token record identifier |
| `eventId` | UUID | FK → Event.id, NOT NULL | Parent event reference |
| `token` | VARCHAR(16) | UNIQUE, NOT NULL | The shareable token string |
| `active` | BOOLEAN | NOT NULL, default TRUE | Whether the token is active |
| `createdAt` | TIMESTAMP | NOT NULL, default NOW | Token creation timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `token`
- Foreign key index on `eventId`
- Index on `active` (for filtering active tokens)

### Media

Represents an uploaded photo or video.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK, auto-generated | Unique media identifier |
| `eventId` | UUID | FK → Event.id, NOT NULL | Parent event reference |
| `filename` | VARCHAR(255) | NOT NULL | Generated filename in storage |
| `originalName` | VARCHAR(255) | NOT NULL | Original filename from upload |
| `mimeType` | VARCHAR(100) | NOT NULL | MIME type (e.g., "image/jpeg") |
| `size` | BIGINT | NOT NULL | File size in bytes |
| `storageKey` | VARCHAR(500) | NOT NULL | Full path in MinIO storage |
| `type` | ENUM | NOT NULL | "photo" or "video" |
| `uploadedBy` | ENUM | NOT NULL | "photographer" or "guest" |
| `createdAt` | TIMESTAMP | NOT NULL, default NOW | Upload timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `eventId`
- Index on `createdAt` (for sorting)

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

  viewTokens   ViewToken[]
  uploadTokens UploadToken[]
  media        Media[]

  @@index([date])
  @@map("events")
}

model ViewToken {
  id        String   @id @default(uuid())
  eventId   String
  token     String   @unique @db.VarChar(16)
  createdAt DateTime @default(now())

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@map("view_tokens")
}

model UploadToken {
  id        String   @id @default(uuid())
  eventId   String
  token     String   @unique @db.VarChar(16)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@index([active])
  @@map("upload_tokens")
}

model Media {
  id           String       @id @default(uuid())
  eventId      String
  filename     String       @db.VarChar(255)
  originalName String       @db.VarChar(255)
  mimeType     String       @db.VarChar(100)
  size         BigInt
  storageKey   String       @db.VarChar(500)
  type         MediaType
  uploadedBy   UploaderType
  createdAt    DateTime     @default(now())

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@index([createdAt])
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
```

---

## Token Generation

Tokens are used for link-based access control.

### View Tokens
- Generated on-demand when photographer clicks "Share"
- Multiple tokens can exist per event
- Each token provides the same gallery access
- Stored in `ViewToken` table

### Upload Tokens
- Generated on-demand when photographer clicks "Request Upload"
- Multiple tokens can exist per event
- Tokens can be deactivated (set `active = false`)
- Deactivated tokens return 404 on access
- Stored in `UploadToken` table

### Requirements
- 16 characters long
- URL-safe characters only (alphanumeric)
- Cryptographically random
- Unique across all tokens (view + upload)

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

## Storage Key Format

Media files are stored in MinIO with the following key structure:

```
{eventId}/{mediaId}/{filename}
```

**Example:**
```
a1b2c3d4-e5f6-7890-abcd-ef1234567890/
  f1e2d3c4-b5a6-7890-dcba-098765432100/
    IMG_1234.jpg
```

**Rationale:**
- Event-level organization for potential batch operations
- Media ID prevents filename collisions
- Original filename preserved for downloads

---

## Cascade Behavior

| Action | Behavior |
|--------|----------|
| Delete Event | All related ViewToken records are deleted (CASCADE) |
| Delete Event | All related UploadToken records are deleted (CASCADE) |
| Delete Event | All related Media records are deleted (CASCADE) |
| Delete Media | Only the Media record is deleted |
| Delete ViewToken | Only the ViewToken record is deleted |
| Delete UploadToken | Only the UploadToken record is deleted |
| Deactivate UploadToken | Sets `active = false`, token still exists but returns 404 |

**Note:** Storage cleanup (MinIO) must be handled in application code before database deletion.
