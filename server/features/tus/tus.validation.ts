/**
 * tus upload metadata validation
 * Validates that uploads have proper authorization context (eventId or guestToken)
 */
import { eventsRepository } from '~/server/features/events'
import { guestTokensRepository } from '~/server/features/tokens'
import { isAllowedMediaType, validateFileExtension } from '~/shared/schemas'
import type { TusUploadMetadata, ValidatedUploadContext } from './tus.types'

/**
 * Parse tus metadata from either a raw string or pre-parsed object
 * tus metadata raw format: "key base64value,key2 base64value2"
 * tus server pre-parses this into a Record<string, string | null>
 */
export function parseMetadata(
  metadata: string | Record<string, string | null> | undefined
): TusUploadMetadata {
  // Handle pre-parsed metadata object (from tus server)
  if (metadata && typeof metadata === 'object') {
    return {
      filename: metadata.filename || 'unknown',
      filetype: metadata.filetype || 'application/octet-stream',
      eventId: metadata.eventId || undefined,
      guestToken: metadata.guestToken || undefined,
      checksum: metadata.checksum || undefined
    }
  }

  // Handle raw metadata string (fallback)
  if (typeof metadata === 'string') {
    const result: Record<string, string> = {}
    const pairs = metadata.split(',')
    for (const pair of pairs) {
      const [key, base64Value] = pair.trim().split(' ')
      if (key && base64Value) {
        try {
          result[key] = Buffer.from(base64Value, 'base64').toString('utf-8')
        } catch {
          // Skip malformed base64 values
        }
      }
    }
    return {
      filename: result.filename || 'unknown',
      filetype: result.filetype || 'application/octet-stream',
      eventId: result.eventId,
      guestToken: result.guestToken,
      checksum: result.checksum
    }
  }

  // No metadata provided
  return { filename: 'unknown', filetype: 'application/octet-stream' }
}

/**
 * Validate upload metadata and return authorized context
 * Throws error if validation fails
 */
export async function validateUploadMetadata(
  metadata: TusUploadMetadata
): Promise<ValidatedUploadContext> {
  // Must have either eventId (photographer) or guestToken (guest)
  if (!metadata.eventId && !metadata.guestToken) {
    throw new Error('Upload must include eventId or guestToken in metadata')
  }

  // Validate MIME type
  if (!isAllowedMediaType(metadata.filetype)) {
    throw new Error(
      'Invalid file type. Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM'
    )
  }

  // Validate file extension matches MIME type
  if (!validateFileExtension(metadata.filename, metadata.filetype)) {
    throw new Error('File extension does not match file type')
  }

  // Photographer upload path - validate eventId
  if (metadata.eventId && !metadata.guestToken) {
    const event = await eventsRepository.findById(metadata.eventId)
    if (!event) {
      throw new Error('Event not found')
    }
    return {
      type: 'photographer',
      eventId: metadata.eventId
    }
  }

  // Guest upload path - validate guestToken
  if (metadata.guestToken) {
    const token = await guestTokensRepository.findByToken(metadata.guestToken)
    if (!token) {
      throw new Error('Invalid guest token')
    }
    if (!token.active) {
      throw new Error('Guest token is inactive')
    }
    if (!token.canUpload) {
      throw new Error('Guest token does not have upload permission')
    }
    if (token.expiresAt && new Date() > token.expiresAt) {
      throw new Error('Guest token has expired')
    }

    return {
      type: 'guest',
      eventId: token.eventId,
      guestTokenId: token.id
    }
  }

  throw new Error('Invalid upload authorization')
}
