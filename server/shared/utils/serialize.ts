/**
 * Serialization utilities
 * Handle data transformation for JSON responses
 */
import { storageService } from '~/server/shared/storage'

/**
 * Convert BigInt fields to numbers for JSON serialization
 *
 * PostgreSQL BIGINT columns are returned as JavaScript BigInt,
 * which cannot be directly serialized to JSON. This function
 * converts the `size` field from BigInt to number.
 *
 * @param media - Media object with potential BigInt size
 * @returns Media object with number size
 */
export function serializeMedia<T extends { size?: bigint | number | null }>(
  media: T
): Omit<T, 'size'> & { size: number | null } {
  if (!media) return media as any

  return {
    ...media,
    size: media.size !== null && media.size !== undefined
      ? Number(media.size)
      : null
  }
}

/**
 * Serialize an array of media objects
 */
export function serializeMediaArray<T extends { size?: bigint | number | null }>(
  items: T[]
): Array<Omit<T, 'size'> & { size: number | null }> {
  return items.map(serializeMedia)
}

interface MediaWithFileFields {
  eventId: string
  filename: string
  thumbnail?: string | null
  thumbnailFallback?: string | null
  preview?: string | null
  previewFallback?: string | null
}

/**
 * Resolve raw filename fields to full URLs.
 * DB stores filenames only; this converts them to serveable URLs
 * using the storage service (local, S3, CDN, etc.).
 */
export function resolveMediaUrls<T extends MediaWithFileFields>(media: T): T {
  const url = (name: string | null | undefined) =>
    name ? storageService.getFileUrl(media.eventId, name) : name

  return {
    ...media,
    filename: storageService.getFileUrl(media.eventId, media.filename),
    thumbnail: url(media.thumbnail) as T['thumbnail'],
    thumbnailFallback: url(media.thumbnailFallback) as T['thumbnailFallback'],
    preview: url(media.preview) as T['preview'],
    previewFallback: url(media.previewFallback) as T['previewFallback'],
  }
}

/**
 * Resolve URLs for an array of media objects
 */
export function resolveMediaUrlsArray<T extends MediaWithFileFields>(items: T[]): T[] {
  return items.map(resolveMediaUrls)
}
