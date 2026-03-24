# Design Patterns

This document explains the design patterns used in the Media Gallery architecture.

---

## 1. Repository Pattern

**Purpose:** Separate data access logic from business logic.

**Location:** `server/features/*/*.repository.ts`

### Structure

```typescript
// events.repository.ts
import { prisma } from '~/server/utils/prisma'
import type { Event, Prisma } from '@prisma/client'

export const eventsRepository = {
  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({ where: { id } })
  },

  async findMany(options?: {
    orderBy?: Prisma.EventOrderByWithRelationInput
  }): Promise<Event[]> {
    return prisma.event.findMany({
      orderBy: options?.orderBy ?? { createdAt: 'desc' }
    })
  },

  async create(data: {
    name: string
    date: Date
    description?: string | null
  }): Promise<Event> {
    return prisma.event.create({ data })
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.event.delete({ where: { id } })
      return true
    } catch {
      return false
    }
  }
}

export type EventsRepository = typeof eventsRepository
```

### Benefits

- **Testability:** Mock repository for unit tests
- **Single Responsibility:** Repository only handles data access
- **Flexibility:** Swap Prisma for another ORM without changing services
- **Consistency:** All data access follows the same pattern

### Usage

```typescript
// In service
import { eventsRepository } from '~/server/features/events'

export const eventsService = {
  async getEvent(id: string) {
    const event = await eventsRepository.findById(id)
    if (!event) throw new NotFoundError('Event', id)
    return event
  }
}
```

---

## 2. Strategy Pattern

**Purpose:** Allow different algorithms (media processors) to be selected at runtime without changing the code that uses them.

**Location:** `server/features/media/processors/`

### Structure

```typescript
// processor.interface.ts
export interface ProcessedMedia {
  thumbnail?: string
  thumbnailFallback?: string
  preview?: string
  previewFallback?: string
}

export interface ProcessOptions {
  outputDir: string
  baseFilename: string
}

export interface MediaProcessor {
  /**
   * Check if this processor can handle the given MIME type
   */
  canProcess(mimeType: string): boolean

  /**
   * Process the media file and generate variants
   */
  process(buffer: Buffer, options: ProcessOptions): Promise<ProcessedMedia>
}
```

```typescript
// image.processor.ts
import sharp from 'sharp'
import type { MediaProcessor, ProcessedMedia, ProcessOptions } from './processor.interface'

export class ImageProcessor implements MediaProcessor {
  private static SUPPORTED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]

  canProcess(mimeType: string): boolean {
    return ImageProcessor.SUPPORTED_TYPES.includes(mimeType)
  }

  async process(buffer: Buffer, options: ProcessOptions): Promise<ProcessedMedia> {
    const { outputDir, baseFilename } = options

    // Generate thumbnail
    const thumbnail = await this.generateThumbnail(buffer, outputDir, baseFilename)

    // Generate preview
    const preview = await this.generatePreview(buffer, outputDir, baseFilename)

    return {
      thumbnail: thumbnail.webp,
      thumbnailFallback: thumbnail.jpeg,
      preview: preview.webp,
      previewFallback: preview.jpeg
    }
  }

  private async generateThumbnail(buffer: Buffer, outputDir: string, baseName: string) {
    // Implementation...
  }

  private async generatePreview(buffer: Buffer, outputDir: string, baseName: string) {
    // Implementation...
  }
}
```

```typescript
// video.processor.ts
import ffmpeg from 'fluent-ffmpeg'
import type { MediaProcessor, ProcessedMedia, ProcessOptions } from './processor.interface'

export class VideoProcessor implements MediaProcessor {
  private static SUPPORTED_TYPES = [
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]

  canProcess(mimeType: string): boolean {
    return VideoProcessor.SUPPORTED_TYPES.includes(mimeType)
  }

  async process(buffer: Buffer, options: ProcessOptions): Promise<ProcessedMedia> {
    // Save buffer to temp file
    // Extract frame with ffmpeg
    // Generate thumbnail
    // Generate preview (compressed video)
    // Clean up temp file
    return { thumbnail, thumbnailFallback, preview, previewFallback }
  }
}
```

```typescript
// processor.factory.ts
import { ImageProcessor } from './image.processor'
import { VideoProcessor } from './video.processor'
import type { MediaProcessor } from './processor.interface'

const processors: MediaProcessor[] = [
  new ImageProcessor(),
  new VideoProcessor()
]

export function getProcessor(mimeType: string): MediaProcessor | null {
  return processors.find(p => p.canProcess(mimeType)) ?? null
}
```

### Benefits

- **Open/Closed Principle:** Add new formats (PDF, audio) without modifying existing code
- **Single Responsibility:** Each processor handles one type of media
- **Testability:** Test processors in isolation
- **Maintainability:** Changes to image processing don't affect video processing

### Usage

```typescript
// In media.service.ts
import { getProcessor } from './processors'

async function processUpload(buffer: Buffer, mimeType: string, outputDir: string) {
  const processor = getProcessor(mimeType)

  if (!processor) {
    throw new UnsupportedMediaTypeError(mimeType)
  }

  return processor.process(buffer, { outputDir, baseFilename: 'file' })
}
```

---

## 3. Service Layer Pattern

**Purpose:** Encapsulate business logic and coordinate between repositories.

**Location:** `server/features/*/*.service.ts`

### Structure

```typescript
// media.service.ts
import { mediaRepository } from './media.repository'
import { eventsRepository } from '~/server/features/events'
import { storageService } from '~/server/shared/storage'
import { getProcessor } from './processors'
import type { CreateMediaInput } from '~/shared/schemas'

export const mediaService = {
  async uploadMedia(eventId: string, file: {
    buffer: Buffer
    mimeType: string
    originalName: string
  }) {
    // 1. Verify event exists
    const event = await eventsRepository.findById(eventId)
    if (!event) throw new NotFoundError('Event', eventId)

    // 2. Save original file
    const { filename, storageKey } = await storageService.save(eventId, file)

    // 3. Create database record
    const media = await mediaRepository.create({
      eventId,
      filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.buffer.length,
      storageKey,
      type: this.getMediaType(file.mimeType),
      uploadedBy: 'photographer'
    })

    // 4. Process variants in background
    this.processVariantsInBackground(media.id, file.buffer, file.mimeType)

    return media
  },

  async deleteMedia(id: string) {
    const media = await mediaRepository.findById(id)
    if (!media) throw new NotFoundError('Media', id)

    // Delete from storage first
    await storageService.delete(media.eventId, media.filename)
    await storageService.deleteVariants(media.eventId, media.filename)

    // Then delete from database
    await mediaRepository.delete(id)

    return true
  },

  private getMediaType(mimeType: string): 'photo' | 'video' {
    return mimeType.startsWith('image/') ? 'photo' : 'video'
  },

  private async processVariantsInBackground(mediaId: string, buffer: Buffer, mimeType: string) {
    // Background processing implementation
  }
}
```

### Benefits

- **Orchestration:** Coordinate multiple operations (file storage + database)
- **Business Logic:** Encapsulate rules (what happens when deleting media)
- **Transaction-like Behavior:** Handle partial failures appropriately
- **Testability:** Mock repositories and storage for unit tests

---

## 4. Middleware Pattern

**Purpose:** Handle cross-cutting concerns (authentication, validation, logging) without duplicating code in every handler.

**Location:** `server/shared/middleware/`

### Structure

```typescript
// require-event.ts
import type { H3Event } from 'h3'
import { eventsRepository } from '~/server/features/events'
import { throwNotFoundError } from '~/server/utils/errors'

/**
 * Middleware that ensures the event exists and attaches it to context
 */
export async function requireEvent(event: H3Event) {
  const eventId = getRouterParam(event, 'id')

  if (!eventId) {
    throwNotFoundError('Event')
  }

  const eventData = await eventsRepository.findById(eventId)

  if (!eventData) {
    throwNotFoundError('Event', eventId)
  }

  // Attach to context for downstream use
  event.context.event = eventData

  return eventData
}
```

### Usage

```typescript
// In API handler
import { requireEvent } from '~/server/shared/middleware'

export default defineEventHandler(async (event) => {
  // This will throw 404 if event doesn't exist
  const eventData = await requireEvent(event)

  // Now safe to use eventData
  const media = await mediaRepository.findByEventId(eventData.id)

  return successResponse(event, media)
})
```

### Benefits

- **DRY:** Write validation logic once
- **Consistency:** Same error responses across all endpoints
- **Composability:** Chain multiple middleware functions
- **Testability:** Test middleware in isolation

---

## 5. Factory Pattern

**Purpose:** Create objects without specifying their concrete classes.

**Location:** `server/features/media/processors/processor.factory.ts`

See [Strategy Pattern](#2-strategy-pattern) for implementation details.

---

## 6. Barrel Export Pattern

**Purpose:** Simplify imports by re-exporting from a single `index.ts` file.

### Structure

```typescript
// server/features/events/index.ts
export { eventsRepository } from './events.repository'
export { eventsService } from './events.service'
export type { Event } from '@prisma/client'
```

### Usage

```typescript
// Instead of:
import { eventsRepository } from '~/server/features/events/events.repository'
import { eventsService } from '~/server/features/events/events.service'

// Use:
import { eventsRepository, eventsService } from '~/server/features/events'
```

### Benefits

- **Cleaner Imports:** One import path per feature
- **Encapsulation:** Hide internal file structure
- **Refactoring:** Change internal structure without updating imports

---

## Pattern Decision Matrix

| Scenario | Pattern to Use |
|----------|----------------|
| Data access (CRUD operations) | Repository |
| Multiple ways to do the same thing | Strategy |
| Complex operations involving multiple entities | Service Layer |
| Cross-cutting concerns | Middleware |
| Creating objects based on runtime conditions | Factory |
| Simplifying imports | Barrel Export |
