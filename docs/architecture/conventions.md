# Coding Conventions

This document defines the naming conventions, coding standards, and best practices for the Media Gallery project.

---

## 1. File Naming

### TypeScript Files

| Type | Pattern | Example |
|------|---------|---------|
| Repository | `{entity}.repository.ts` | `events.repository.ts` |
| Service | `{entity}.service.ts` | `media.service.ts` |
| Schema | `{entity}.schema.ts` | `event.schema.ts` |
| Types | `{entity}.types.ts` | `media.types.ts` |
| Interface | `{name}.interface.ts` | `storage.interface.ts` |
| Processor | `{type}.processor.ts` | `image.processor.ts` |
| Factory | `{name}.factory.ts` | `processor.factory.ts` |
| Middleware | `{name}.ts` | `require-event.ts` |
| Utility | `{name}.ts` | `token.ts`, `serialize.ts` |
| Barrel export | `index.ts` | `index.ts` |

### Vue Files

| Type | Pattern | Example |
|------|---------|---------|
| Page | `[param].vue` or `index.vue` | `[id].vue`, `index.vue` |
| Component | `PascalCase.vue` | `MediaCard.vue`, `EventHeader.vue` |
| Composable | `use{Name}.ts` | `useEventMedia.ts`, `useLightbox.ts` |
| Layout | `{name}.vue` | `default.vue` |

### Directories

- Use lowercase with hyphens for multi-word names: `upload-tokens/`
- Group by feature, not by type: `features/media/` not `repositories/`

---

## 2. Naming Conventions

### Variables and Functions

```typescript
// camelCase for variables and functions
const eventId = getRouterParam(event, 'id')
async function uploadMedia(file: File) {}

// UPPER_SNAKE_CASE for constants
const MAX_FILE_SIZE = 500 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png']

// Prefix booleans with is, has, can, should
const isActive = token.active
const hasMedia = media.length > 0
const canUpload = validateToken(token)
```

### Types and Interfaces

```typescript
// PascalCase for types and interfaces
interface MediaProcessor {}
type CreateEventInput = z.infer<typeof createEventSchema>

// Suffix DTOs with Input/Output
type CreateEventInput = { name: string; date: string }
type EventOutput = { id: string; name: string }

// Prefix interfaces with I only when needed for disambiguation
interface IStorageService {}  // When class is StorageService
```

### API Handlers

```typescript
// File names match HTTP method and route segment
// POST /api/events           → server/api/events/index.post.ts
// GET  /api/events/:id       → server/api/events/[id].get.ts
// DELETE /api/media/:id      → server/api/media/[id].delete.ts
// PATCH /api/tokens/:id/deactivate → server/api/tokens/[id]/deactivate.patch.ts
```

---

## 3. Code Organization

### Import Order

```typescript
// 1. Node.js built-in modules
import { randomUUID } from 'crypto'
import { join } from 'path'

// 2. External dependencies
import { z } from 'zod'
import sharp from 'sharp'

// 3. Internal modules (absolute paths with ~/)
import { prisma } from '~/server/utils/prisma'
import { eventsRepository } from '~/server/features/events'
import { successResponse } from '~/server/utils/response'

// 4. Relative imports (same feature)
import { serializeMedia } from './serialize'
import type { MediaProcessor } from './processor.interface'

// 5. Type-only imports last
import type { H3Event } from 'h3'
import type { Event, Media } from '@prisma/client'
```

### Export Patterns

```typescript
// Named exports (preferred)
export const eventsRepository = { ... }
export function generateToken(): string { ... }
export class ImageProcessor implements MediaProcessor { ... }

// Barrel exports in index.ts
// server/features/events/index.ts
export { eventsRepository } from './events.repository'
export { eventsService } from './events.service'

// Avoid default exports (except Vue components)
// ❌ export default eventsRepository
// ✅ export const eventsRepository = { ... }
```

### Function Structure

```typescript
// Small, focused functions (< 50 lines ideally)
// Single responsibility

// Good: One function, one job
async function validateToken(token: string): Promise<boolean> {
  const record = await tokenRepository.findByToken(token)
  return record !== null && record.active
}

// Bad: Function doing multiple unrelated things
async function validateAndProcessAndSave(/* ... */) {
  // Validation logic
  // Processing logic
  // Database logic
  // Too many responsibilities!
}
```

---

## 4. API Handler Structure

```typescript
// Standard handler structure
import { requireEvent } from '~/server/shared/middleware'
import { mediaService } from '~/server/features/media'
import { uploadMediaSchema } from '~/shared/schemas'
import { createdResponse } from '~/server/utils/response'
import { throwValidationError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  // 1. Middleware (guards)
  const eventData = await requireEvent(event)

  // 2. Parse and validate input
  const formData = await readMultipartFormData(event)
  const file = formData?.find(f => f.name === 'file')

  if (!file) {
    throwValidationError('No file provided')
  }

  // 3. Call service
  const media = await mediaService.uploadMedia(eventData.id, {
    buffer: file.data,
    mimeType: file.type || '',
    originalName: file.filename || 'unknown'
  })

  // 4. Return formatted response
  return createdResponse(event, media)
})
```

**Handler Rules:**
- Keep handlers thin (< 30 lines)
- No business logic in handlers
- Always validate input
- Use services for orchestration
- Use standard response helpers

---

## 5. Repository Structure

```typescript
// Standard repository structure
import { prisma } from '~/server/utils/prisma'
import { serializeMedia } from '~/server/shared/utils'
import type { Media, Prisma } from '@prisma/client'

export const mediaRepository = {
  async findById(id: string) {
    const media = await prisma.media.findUnique({
      where: { id }
    })
    return media ? serializeMedia(media) : null
  },

  async findByEventId(
    eventId: string,
    options?: { skip?: number; take?: number }
  ) {
    const items = await prisma.media.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take
    })
    return items.map(serializeMedia)
  },

  async create(data: Prisma.MediaCreateInput) {
    const media = await prisma.media.create({ data })
    return serializeMedia(media)
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.media.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }
}

export type MediaRepository = typeof mediaRepository
```

**Repository Rules:**
- Only data access logic (no business rules)
- Handle data transformation (BigInt → number)
- Use Prisma's type-safe queries
- Return `null` for not found, not throw

---

## 6. Service Structure

```typescript
// Standard service structure
import { eventsRepository } from '~/server/features/events'
import { mediaRepository } from './media.repository'
import { storageService } from '~/server/shared/storage'
import { getProcessor } from './processors'
import { NotFoundError } from '~/server/utils/errors'

export const mediaService = {
  async uploadMedia(
    eventId: string,
    file: { buffer: Buffer; mimeType: string; originalName: string }
  ) {
    // 1. Validate preconditions
    const event = await eventsRepository.findById(eventId)
    if (!event) {
      throw new NotFoundError('Event', eventId)
    }

    // 2. Execute main logic
    const stored = await storageService.save(eventId, file)
    const media = await mediaRepository.create({
      eventId,
      filename: stored.filename,
      // ... other fields
    })

    // 3. Trigger side effects (non-blocking)
    this.processVariantsInBackground(media.id, file.buffer, file.mimeType)

    // 4. Return result
    return media
  },

  async deleteMedia(id: string) {
    // Services can orchestrate multiple operations
    const media = await mediaRepository.findById(id)
    if (!media) {
      throw new NotFoundError('Media', id)
    }

    // Delete file first (can be retried if DB delete fails)
    await storageService.delete(media.eventId, media.filename)

    // Then delete record
    await mediaRepository.delete(id)

    return true
  },

  private async processVariantsInBackground(
    mediaId: string,
    buffer: Buffer,
    mimeType: string
  ) {
    // Background processing
  }
}
```

**Service Rules:**
- Orchestrate multiple repositories/services
- Contain business logic and validation
- Handle transactions when needed
- Can throw domain-specific errors

---

## 7. Zod Schema Structure

```typescript
// Standard schema structure
import { z } from 'zod'

// Base schema (reusable)
const idSchema = z.string().uuid()
const nameSchema = z.string().min(1).max(100)
const dateSchema = z.string().datetime()

// Create input schema
export const createEventSchema = z.object({
  name: nameSchema,
  date: dateSchema,
  description: z.string().max(500).optional()
})

// Update input schema (partial)
export const updateEventSchema = createEventSchema.partial()

// Query params schema
export const listMediaQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

// Export inferred types
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>
```

---

## 8. Error Handling

```typescript
// Use error helpers for consistent responses
import {
  throwNotFoundError,
  throwValidationError,
  throwStateConflictError
} from '~/server/utils/errors'

// Not found
if (!event) {
  throwNotFoundError('Event', eventId)  // 404
}

// Validation error
if (!file) {
  throwValidationError('No file provided')  // 400
}

// Validation with field details
const result = schema.safeParse(body)
if (!result.success) {
  throwValidationError('Invalid input', result.error.flatten().fieldErrors)
}

// State conflict
if (!token.active) {
  throwStateConflictError('Token is already deactivated')  // 409
}
```

---

## 9. Vue Component Structure

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import type { Media } from '~/shared/types'

// 2. Props and emits
const props = defineProps<{
  eventId: string
  media: Media[]
}>()

const emit = defineEmits<{
  delete: [mediaId: string]
  select: [media: Media]
}>()

// 3. Composables
const { selectedItems, toggleSelection } = useMediaSelection()

// 4. Reactive state
const isLoading = ref(false)
const error = ref<string | null>(null)

// 5. Computed properties
const selectedCount = computed(() => selectedItems.value.length)

// 6. Methods
async function handleDelete(id: string) {
  isLoading.value = true
  try {
    await $fetch(`/api/media/${id}`, { method: 'DELETE' })
    emit('delete', id)
  } catch (e) {
    error.value = 'Failed to delete media'
  } finally {
    isLoading.value = false
  }
}

// 7. Lifecycle hooks
onMounted(() => {
  // Initialize
})
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Styles (prefer Tailwind classes in template) */
</style>
```

---

## 10. Comments

```typescript
// Use comments sparingly - code should be self-documenting

// ✅ Good: Explain WHY, not WHAT
// We process videos in background because ffmpeg is slow
// and we don't want to block the upload response
processVideoInBackground(mediaId)

// ❌ Bad: Stating the obvious
// Loop through media items
for (const item of media) { ... }

// ✅ Good: Document public APIs
/**
 * Generate a cryptographically secure token for sharing links.
 * @returns 16-character alphanumeric string
 */
export function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 16)
}

// ✅ Good: Mark TODOs with context
// TODO(auth): Add user ID validation when auth is implemented
```

---

## 11. Git Commit Messages

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code change that neither fixes a bug nor adds a feature
- docs: Documentation only changes
- style: Formatting, missing semi colons, etc; no code change
- test: Adding tests
- chore: Maintain (dependencies, build scripts)

Examples:
feat: add selective media sharing
fix: resolve BigInt serialization in media response
refactor: extract storage service from upload handler
docs: add architecture documentation
```
