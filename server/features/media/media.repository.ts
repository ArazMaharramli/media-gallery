/**
 * Media repository
 * Handles all data access operations for Media entities
 */
import { prisma } from '~/server/utils/prisma'
import { serializeMedia, serializeMediaArray } from '~/server/shared/utils'
import type { Media, MediaType, UploaderType, Prisma } from '@prisma/client'

export interface CreateMediaData {
  eventId: string
  guestTokenId?: string | null
  filename: string
  originalName: string
  mimeType: string
  size: number
  storageKey: string
  type: MediaType
  uploadedBy: UploaderType
  thumbnail?: string | null
  thumbnailFallback?: string | null
  preview?: string | null
  previewFallback?: string | null
}

export interface UpdateMediaData {
  thumbnail?: string | null
  thumbnailFallback?: string | null
  preview?: string | null
  previewFallback?: string | null
}

export interface PaginationOptions {
  skip?: number
  take?: number
}

// Type for serialized media (size as number instead of BigInt)
export type SerializedMedia = Omit<Media, 'size'> & { size: number | null }

export const mediaRepository = {
  /**
   * Find a single media item by ID
   */
  async findById(id: string): Promise<SerializedMedia | null> {
    const media = await prisma.media.findUnique({
      where: { id }
    })
    return media ? serializeMedia(media) : null
  },

  /**
   * Find all media for an event with optional pagination
   */
  async findByEventId(
    eventId: string,
    options?: PaginationOptions
  ): Promise<SerializedMedia[]> {
    const items = await prisma.media.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take
    })
    return serializeMediaArray(items)
  },

  /**
   * Find multiple media items by IDs
   */
  async findByIds(ids: string[]): Promise<SerializedMedia[]> {
    const items = await prisma.media.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: 'desc' }
    })
    return serializeMediaArray(items)
  },

  /**
   * Find all media uploaded by a specific guest token with count
   */
  async findByGuestTokenId(
    guestTokenId: string,
    options?: PaginationOptions
  ): Promise<{ items: SerializedMedia[]; total: number }> {
    const [items, total] = await prisma.$transaction([
      prisma.media.findMany({
        where: { guestTokenId },
        orderBy: { createdAt: 'desc' },
        skip: options?.skip,
        take: options?.take
      }),
      prisma.media.count({ where: { guestTokenId } })
    ])
    return { items: serializeMediaArray(items), total }
  },

  /**
   * Find media by IDs OR guestTokenId (for shared + own uploads)
   */
  async findByIdsOrGuestTokenId(
    ids: string[],
    guestTokenId: string,
    options?: PaginationOptions
  ): Promise<{ items: SerializedMedia[]; total: number }> {
    const where = {
      OR: [
        { id: { in: ids } },
        { guestTokenId }
      ]
    }
    const [items, total] = await prisma.$transaction([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: options?.skip,
        take: options?.take
      }),
      prisma.media.count({ where })
    ])
    return { items: serializeMediaArray(items), total }
  },

  /**
   * Find all media for an event with count
   */
  async findByEventIdWithCount(
    eventId: string,
    options?: PaginationOptions
  ): Promise<{ items: SerializedMedia[]; total: number }> {
    const [items, total] = await prisma.$transaction([
      prisma.media.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        skip: options?.skip,
        take: options?.take
      }),
      prisma.media.count({ where: { eventId } })
    ])
    return { items: serializeMediaArray(items), total }
  },

  /**
   * Create a new media record
   */
  async create(data: CreateMediaData): Promise<SerializedMedia> {
    const media = await prisma.media.create({
      data: {
        eventId: data.eventId,
        guestTokenId: data.guestTokenId ?? null,
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: BigInt(data.size),
        storageKey: data.storageKey,
        type: data.type,
        uploadedBy: data.uploadedBy,
        thumbnail: data.thumbnail ?? null,
        thumbnailFallback: data.thumbnailFallback ?? null,
        preview: data.preview ?? null,
        previewFallback: data.previewFallback ?? null
      }
    })
    return serializeMedia(media)
  },

  /**
   * Update a media record (typically for adding variant paths)
   */
  async update(id: string, data: UpdateMediaData): Promise<SerializedMedia | null> {
    try {
      const media = await prisma.media.update({
        where: { id },
        data
      })
      return serializeMedia(media)
    } catch {
      return null
    }
  },

  /**
   * Delete a media record
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.media.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  },

  /**
   * Delete multiple media records
   */
  async deleteMany(ids: string[]): Promise<number> {
    const result = await prisma.media.deleteMany({
      where: { id: { in: ids } }
    })
    return result.count
  }
}

export type MediaRepository = typeof mediaRepository
