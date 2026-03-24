# Directory Structure

This document describes the target directory structure after the architecture refactoring.

---

## Full Directory Tree

```
media-gallery/
├── docs/
│   ├── architecture/              # Architecture documentation
│   │   ├── README.md              # Overview and principles
│   │   ├── directory-structure.md # This file
│   │   ├── patterns.md            # Design patterns
│   │   ├── data-flow.md           # Request/response flows
│   │   └── conventions.md         # Coding standards
│   ├── features/                  # Feature specifications
│   └── requirements/              # Requirements documentation
│
├── shared/                        # Code shared between client & server
│   ├── schemas/                   # Zod validation schemas
│   │   ├── index.ts               # Barrel export
│   │   ├── event.schema.ts        # Event validation
│   │   ├── media.schema.ts        # Media validation
│   │   ├── token.schema.ts        # GuestToken validation
│   │   └── common.schema.ts       # Shared validation rules
│   └── types/                     # TypeScript types
│       ├── index.ts               # Barrel export
│       ├── event.types.ts         # Event types
│       ├── media.types.ts         # Media types
│       └── api.types.ts           # API response types
│
├── server/
│   ├── api/                       # HTTP route handlers (thin)
│   │   ├── events/
│   │   │   ├── index.post.ts      # POST /api/events
│   │   │   ├── [id].get.ts        # GET /api/events/:id
│   │   │   └── [id]/
│   │   │       ├── media/
│   │   │       │   └── index.get.ts
│   │   │       ├── upload/
│   │   │       │   └── index.post.ts
│   │   │       └── guest-tokens/
│   │   │           ├── index.get.ts     # List all guest tokens
│   │   │           ├── index.post.ts    # Create guest token
│   │   │           └── [tokenId]/
│   │   │               └── revoke.patch.ts
│   │   ├── guest/
│   │   │   ├── [token].get.ts     # GET /api/guest/:token
│   │   │   └── [token]/
│   │   │       ├── upload.post.ts # POST /api/guest/:token/upload
│   │   │       └── media/
│   │   │           └── [mediaId].delete.ts
│   │   ├── media/
│   │   │   └── [id].delete.ts     # DELETE /api/media/:id
│   │   └── uploads/
│   │       └── [eventId]/
│   │           └── [filename].get.ts
│   │
│   ├── features/                  # Feature modules (vertical slices)
│   │   ├── events/
│   │   │   ├── index.ts           # Barrel export
│   │   │   ├── events.repository.ts
│   │   │   └── events.service.ts
│   │   │
│   │   ├── media/
│   │   │   ├── index.ts           # Barrel export
│   │   │   ├── media.repository.ts
│   │   │   ├── media.service.ts
│   │   │   └── processors/        # Media processing (Strategy pattern)
│   │   │       ├── index.ts
│   │   │       ├── processor.interface.ts
│   │   │       ├── image.processor.ts
│   │   │       ├── video.processor.ts
│   │   │       └── processor.factory.ts
│   │   │
│   │   └── tokens/
│   │       └── guest-tokens/
│   │           ├── index.ts
│   │           ├── guest-tokens.repository.ts
│   │           └── guest-tokens.service.ts
│   │
│   ├── shared/                    # Shared backend code
│   │   ├── middleware/
│   │   │   ├── index.ts
│   │   │   └── require-event.ts   # Event existence guard
│   │   │
│   │   ├── storage/               # File storage abstraction
│   │   │   ├── index.ts
│   │   │   ├── storage.interface.ts
│   │   │   └── local-storage.service.ts
│   │   │
│   │   └── utils/
│   │       ├── index.ts
│   │       ├── token.ts           # Token generation
│   │       └── serialize.ts       # BigInt serialization
│   │
│   ├── middleware/                # Nuxt server middleware
│   │   └── 01.trace.ts            # Request tracing
│   │
│   ├── plugins/
│   │   └── error-handler.ts       # Global error handling
│   │
│   ├── utils/                     # Legacy utilities (to be deprecated)
│   │   ├── db.ts                  # → Use repositories instead
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── errors.ts              # Error helpers
│   │   └── response.ts            # Response helpers
│   │
│   └── error.ts                   # Error page handler
│
├── composables/                   # Vue composable functions
│   ├── useEventMedia.ts           # Media CRUD operations
│   ├── useMediaUpload.ts          # Upload queue management
│   ├── useTokenManagement.ts      # Guest token operations
│   ├── useMediaSelection.ts       # Selection mode state
│   └── useLightbox.ts             # Lightbox state
│
├── components/                    # Vue components
│   ├── event/                     # Event dashboard components
│   │   ├── EventHeader.vue
│   │   ├── EventMediaGrid.vue
│   │   ├── EventUploader.vue
│   │   └── tokens/
│   │       ├── GuestTokenList.vue
│   │       ├── CreateGuestTokenModal.vue
│   │       └── ShareModal.vue
│   │
│   ├── media/                     # Media display components
│   │   ├── MediaCard.vue
│   │   ├── MediaLightbox.vue
│   │   └── VideoPlayer.vue
│   │
│   └── common/                    # Shared UI components
│       ├── ConfirmModal.vue
│       ├── Toast.vue
│       └── Pagination.vue
│
├── pages/                         # Nuxt page components
│   ├── index.vue                  # Home / create event
│   ├── event/
│   │   └── [id].vue               # Event dashboard
│   └── guest/
│       └── [token].vue            # Guest access page (view + upload)
│
├── layouts/
│   └── default.vue                # Default layout
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
│
├── public/                        # Static assets
├── uploads/                       # Uploaded files (gitignored)
│
├── nuxt.config.ts                 # Nuxt configuration
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
├── docker-compose.yml             # Docker services
├── Dockerfile                     # App container definition
└── docker-entrypoint.sh           # Container startup script
```

---

## Directory Purposes

### `/shared/`
Code that runs on **both client and server**. Primarily validation schemas (Zod) and TypeScript types.

```typescript
// Import in Vue component
import { createEventSchema } from '~/shared/schemas'

// Import in API handler
import { createEventSchema } from '~/shared/schemas'
```

### `/server/features/`
Backend feature modules organized by domain. Each feature contains:
- `*.repository.ts` - Data access (Prisma queries)
- `*.service.ts` - Business logic
- `processors/` - Specialized processing (if needed)

### `/server/shared/`
Backend-only shared code:
- `middleware/` - Request guards and interceptors
- `storage/` - File storage abstraction
- `utils/` - Helper functions

### `/server/api/`
HTTP route definitions. Should be thin - just parse input, call service, return response.

### `/composables/`
Vue composable functions for reusable stateful logic.

### `/components/`
Vue components organized by feature area.

---

## Import Conventions

### Server-side imports

```typescript
// Feature imports (prefer barrel exports)
import { eventsRepository } from '~/server/features/events'
import { mediaService } from '~/server/features/media'

// Shared utilities
import { generateToken } from '~/server/shared/utils'
import { storageService } from '~/server/shared/storage'
import { requireEvent } from '~/server/shared/middleware'

// Response/error helpers (legacy location)
import { successResponse } from '~/server/utils/response'
import { throwNotFoundError } from '~/server/utils/errors'

// Shared schemas (client + server)
import { createEventSchema } from '~/shared/schemas'
```

### Client-side imports

```typescript
// Composables
import { useEventMedia } from '~/composables/useEventMedia'
import { useLightbox } from '~/composables/useLightbox'

// Components
import EventHeader from '~/components/event/EventHeader.vue'
import MediaCard from '~/components/media/MediaCard.vue'

// Shared schemas
import { createEventSchema } from '~/shared/schemas'
```

---

## File Naming Conventions

| Pattern | Example | Purpose |
|---------|---------|---------|
| `*.repository.ts` | `events.repository.ts` | Data access layer |
| `*.service.ts` | `media.service.ts` | Business logic |
| `*.schema.ts` | `event.schema.ts` | Zod validation |
| `*.types.ts` | `media.types.ts` | TypeScript types |
| `*.interface.ts` | `storage.interface.ts` | Interface definitions |
| `*.processor.ts` | `image.processor.ts` | Processing strategies |
| `*.factory.ts` | `processor.factory.ts` | Factory functions |
| `use*.ts` | `useEventMedia.ts` | Vue composables |
| `*.vue` | `MediaCard.vue` | Vue components (PascalCase) |
