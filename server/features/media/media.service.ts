/**
 * Media service
 * Orchestrates media upload, processing, and deletion operations
 */
import { join } from 'path'
import { readFile, stat } from 'fs/promises'
import { eventsRepository } from '~/server/features/events'
import { mediaRepository, type SerializedMedia } from './media.repository'
import { getProcessor } from './processors'
import { storageService } from '~/server/shared/storage'
import { getMediaTypeFromMime, isAllowedMediaType } from '~/shared/schemas'

export interface UploadMediaInput {
  eventId: string
  buffer: Buffer
  mimeType: string
  originalName: string
  guestTokenId?: string | null
  uploadedBy: 'photographer' | 'guest'
}

export interface UploadMediaFromFileInput {
  eventId: string
  filePath: string
  mimeType: string
  originalName: string
  size: number
  guestTokenId?: string | null
  uploadedBy: 'photographer' | 'guest'
}

export interface UploadMediaResult extends SerializedMedia {}

class MediaServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'MediaServiceError'
  }
}

export const mediaService = {
  /**
   * Upload and process media file
   * Saves original file, creates database record, and triggers background variant processing
   */
  async uploadMedia(input: UploadMediaInput): Promise<UploadMediaResult> {
    const { eventId, buffer, mimeType, originalName, guestTokenId, uploadedBy } = input
    const config = useRuntimeConfig()
    const maxStandardSize = config.public.upload.maxStandardSize

    // Validate event exists
    const event = await eventsRepository.findById(eventId)
    if (!event) {
      throw new MediaServiceError('Event not found', 'NOT_FOUND', 404)
    }

    // Validate file type
    if (!isAllowedMediaType(mimeType)) {
      throw new MediaServiceError(
        'Invalid file type. Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM',
        'INVALID_TYPE'
      )
    }

    // Validate file size (standard upload limit)
    if (buffer.length > maxStandardSize) {
      throw new MediaServiceError(
        `File too large. Maximum size for standard uploads is ${Math.round(maxStandardSize / (1024 * 1024))}MB`,
        'FILE_TOO_LARGE',
        413
      )
    }

    // Determine media type
    const mediaType = getMediaTypeFromMime(mimeType)

    // Save original file to storage
    const { filename, storageKey } = await storageService.save(
      eventId,
      buffer,
      originalName
    )

    // Process image variants synchronously (fast)
    let variants = {
      thumbnail: null as string | null,
      thumbnailFallback: null as string | null,
      preview: null as string | null,
      previewFallback: null as string | null
    }

    if (mediaType === 'photo') {
      try {
        const processor = getProcessor(mimeType)
        if (processor) {
          const outputDir = storageService.getEventDir(eventId)
          const result = await processor.process(buffer, {
            outputDir,
            baseFilename: filename
          })
          variants = {
            thumbnail: result.thumbnail ?? null,
            thumbnailFallback: result.thumbnailFallback ?? null,
            preview: result.preview ?? null,
            previewFallback: result.previewFallback ?? null
          }
        }
      } catch (err) {
        console.error('Failed to generate image variants:', err)
        // Continue without variants - original file is saved
      }
    }

    // Create database record
    const media = await mediaRepository.create({
      eventId,
      guestTokenId: guestTokenId ?? null,
      filename,
      originalName,
      mimeType,
      size: buffer.length,
      storageKey,
      type: mediaType,
      uploadedBy,
      ...variants
    })

    // Process video variants in background (slow)
    if (mediaType === 'video') {
      this.processVideoVariantsInBackground(media.id, eventId, filename)
    }

    return media
  },

  /**
   * Upload and process media file from a file path
   * Used by tus chunked uploads - more memory efficient for large files
   */
  async uploadMediaFromFile(input: UploadMediaFromFileInput): Promise<UploadMediaResult> {
    const { eventId, filePath, mimeType, originalName, size, guestTokenId, uploadedBy } = input

    // Validate event exists
    const event = await eventsRepository.findById(eventId)
    if (!event) {
      throw new MediaServiceError('Event not found', 'NOT_FOUND', 404)
    }

    // Validate file type
    if (!isAllowedMediaType(mimeType)) {
      throw new MediaServiceError(
        'Invalid file type. Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM',
        'INVALID_TYPE'
      )
    }

    // Determine media type
    const mediaType = getMediaTypeFromMime(mimeType)

    // Move file to final location (efficient for large files)
    const { filename, storageKey } = await storageService.moveToEvent(
      eventId,
      filePath,
      originalName
    )

    // Process image variants synchronously (fast)
    let variants = {
      thumbnail: null as string | null,
      thumbnailFallback: null as string | null,
      preview: null as string | null,
      previewFallback: null as string | null
    }

    if (mediaType === 'photo') {
      try {
        const processor = getProcessor(mimeType)
        if (processor) {
          const outputDir = storageService.getEventDir(eventId)
          const finalPath = join(outputDir, filename)
          // Read file for image processing (images are typically smaller)
          const buffer = await readFile(finalPath)
          const result = await processor.process(buffer, {
            outputDir,
            baseFilename: filename
          })
          variants = {
            thumbnail: result.thumbnail ?? null,
            thumbnailFallback: result.thumbnailFallback ?? null,
            preview: result.preview ?? null,
            previewFallback: result.previewFallback ?? null
          }
        }
      } catch (err) {
        console.error('Failed to generate image variants:', err)
        // Continue without variants - original file is saved
      }
    }

    // Create database record
    const media = await mediaRepository.create({
      eventId,
      guestTokenId: guestTokenId ?? null,
      filename,
      originalName,
      mimeType,
      size,
      storageKey,
      type: mediaType,
      uploadedBy,
      ...variants
    })

    // Process video variants in background (slow)
    if (mediaType === 'video') {
      this.processVideoVariantsInBackground(media.id, eventId, filename)
    }

    return media
  },

  /**
   * Delete a media item and its files
   */
  async deleteMedia(id: string): Promise<boolean> {
    const media = await mediaRepository.findById(id)
    if (!media) {
      throw new MediaServiceError('Media not found', 'NOT_FOUND', 404)
    }

    // Delete original file
    await storageService.delete(media.eventId, media.filename)

    // Delete variant files
    await storageService.deleteVariants(media.eventId, media.filename)

    // Delete database record
    await mediaRepository.delete(id)

    return true
  },

  /**
   * Delete multiple media items
   */
  async deleteMediaBatch(ids: string[]): Promise<number> {
    let deletedCount = 0

    for (const id of ids) {
      try {
        await this.deleteMedia(id)
        deletedCount++
      } catch {
        // Continue with other deletions
      }
    }

    return deletedCount
  },

  /**
   * Process video variants in background
   * Updates database record when complete
   */
  async processVideoVariantsInBackground(
    mediaId: string,
    eventId: string,
    filename: string
  ): Promise<void> {
    // Run asynchronously, don't await
    setImmediate(async () => {
      try {
        console.log('Starting background video processing for:', filename)

        const processor = getProcessor('video/mp4') // Video processor handles all video types
        if (!processor) {
          console.error('No video processor found')
          return
        }

        const outputDir = storageService.getEventDir(eventId)
        const videoPath = join(outputDir, filename)

        const result = await processor.process(videoPath, {
          outputDir,
          baseFilename: filename
        })

        // Update database with variant paths
        await mediaRepository.update(mediaId, {
          thumbnail: result.thumbnail ?? null,
          thumbnailFallback: result.thumbnailFallback ?? null,
          preview: result.preview ?? null,
          previewFallback: result.previewFallback ?? null
        })

        console.log('Video processing complete for:', mediaId)
      } catch (err) {
        console.error('Background video processing failed:', err)
        // Record stays without variants - original will be used as fallback
      }
    })
  }
}

export type MediaService = typeof mediaService
