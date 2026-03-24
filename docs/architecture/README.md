# Architecture Overview

This document describes the architecture of the Media Gallery application following **Vertical Slice Architecture** principles with **SOLID** design patterns.

---

## Architectural Principles

### 1. Vertical Slice Architecture

Instead of organizing code by technical layers (controllers, services, repositories), we organize by **feature**. Each feature contains all the code needed to implement that functionality.

```
Traditional (Horizontal):          Vertical Slice:
├── controllers/                   ├── features/
│   ├── events.ts                  │   ├── events/
│   ├── media.ts                   │   │   ├── events.repository.ts
│   └── tokens.ts                  │   │   ├── events.service.ts
├── services/                      │   │   └── handlers/
│   ├── events.ts                  │   ├── media/
│   ├── media.ts                   │   │   ├── media.repository.ts
│   └── tokens.ts                  │   │   ├── media.service.ts
├── repositories/                  │   │   ├── processors/
│   ├── events.ts                  │   │   └── handlers/
│   └── ...                        │   └── tokens/
```

**Benefits:**
- Changes to a feature are localized to one folder
- Easier to understand feature scope
- Reduces merge conflicts in team environments
- Features can be developed/tested independently

### 2. SOLID Principles Applied

| Principle | Application |
|-----------|-------------|
| **S**ingle Responsibility | Each file has one job: repository = data access, service = business logic, handler = HTTP |
| **O**pen/Closed | Media processors use Strategy pattern - add new formats without changing existing code |
| **L**iskov Substitution | Storage interface allows swapping LocalStorage for S3Storage |
| **I**nterface Segregation | Small, focused interfaces - repositories expose only needed methods |
| **D**ependency Inversion | Services depend on interfaces, not concrete implementations |

### 3. DRY (Don't Repeat Yourself)

- Shared validation schemas used by both client and server
- Common utilities extracted to `shared/` folder
- Middleware handles cross-cutting concerns (auth, validation, logging)

---

## Layer Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP Request                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                        │
│  • Request tracing (trace IDs)                              │
│  • Authentication (future)                                   │
│  • Rate limiting (future)                                    │
│  • Event existence checks                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       HANDLER LAYER                          │
│  server/api/**/*.ts                                         │
│  • Parse request (params, query, body)                      │
│  • Validate input (Zod schemas)                             │
│  • Call service methods                                      │
│  • Format response                                           │
│  • Should be thin (~20-50 lines)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                          │
│  server/features/*/*.service.ts                             │
│  • Business logic and orchestration                         │
│  • Coordinates multiple repositories                         │
│  • Handles complex operations                                │
│  • Transaction management                                    │
│  • Delegates to processors for specialized work             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     REPOSITORY LAYER                         │
│  server/features/*/*.repository.ts                          │
│  • Data access only (CRUD)                                  │
│  • Prisma queries                                           │
│  • Data transformation (BigInt → number)                    │
│  • No business logic                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE (Prisma)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Adding a New Feature

### Example: Adding "Albums" feature

1. **Create feature folder:**
   ```
   server/features/albums/
   ├── albums.repository.ts   # Data access
   ├── albums.service.ts      # Business logic
   ├── albums.types.ts        # TypeScript types
   └── handlers/
       ├── create-album.ts    # POST /api/albums
       ├── get-album.ts       # GET /api/albums/:id
       └── list-albums.ts     # GET /api/events/:id/albums
   ```

2. **Create validation schema:**
   ```
   shared/schemas/album.schema.ts
   ```

3. **Add Prisma model:**
   ```prisma
   model Album {
     id        String   @id @default(uuid())
     eventId   String
     name      String
     ...
   }
   ```

4. **Create API routes:**
   ```
   server/api/albums/index.post.ts  → handlers/create-album.ts
   server/api/albums/[id].get.ts    → handlers/get-album.ts
   ```

5. **Add Vue components if needed:**
   ```
   components/albums/
   ├── AlbumList.vue
   └── AlbumCard.vue
   ```

---

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `server/features/` | Backend feature modules (vertical slices) |
| `server/shared/` | Shared backend utilities, middleware, storage |
| `server/api/` | HTTP route definitions (thin handlers) |
| `shared/schemas/` | Zod validation schemas (used by client + server) |
| `shared/types/` | TypeScript types (used by client + server) |
| `composables/` | Vue composable functions |
| `components/` | Vue components organized by feature |
| `pages/` | Nuxt page components (route pages) |

---

## Related Documentation

- [Directory Structure](./directory-structure.md) - Full folder tree with explanations
- [Design Patterns](./patterns.md) - Repository, Strategy, and other patterns
- [Data Flow](./data-flow.md) - Request lifecycle and data transformation
- [Conventions](./conventions.md) - Naming, coding standards, and best practices
