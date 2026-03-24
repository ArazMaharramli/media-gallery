/**
 * Media validation schemas
 * Used by both client (Vue) and server (API handlers)
 */
import { z } from 'zod'

// Supported media types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
] as const

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm'
] as const

export const ALLOWED_MEDIA_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES
] as const

// File constraints
export const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

// Media type enum
export const mediaTypeSchema = z.enum(['photo', 'video'])

// Uploader type enum
export const uploaderTypeSchema = z.enum(['photographer', 'guest'])

// Upload validation
export const uploadMediaSchema = z.object({
  mimeType: z.enum(ALLOWED_MEDIA_TYPES, {
    errorMap: () => ({
      message: 'Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM'
    })
  }),
  size: z
    .number()
    .max(MAX_FILE_SIZE, 'File size must be less than 500MB')
})

// Media output (from API)
export const mediaOutputSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  guestTokenId: z.string().uuid().nullable(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  storageKey: z.string(),
  type: mediaTypeSchema,
  uploadedBy: uploaderTypeSchema,
  thumbnail: z.string().nullable(),
  thumbnailFallback: z.string().nullable(),
  preview: z.string().nullable(),
  previewFallback: z.string().nullable(),
  createdAt: z.string()
})

// Types
export type MediaType = z.infer<typeof mediaTypeSchema>
export type UploaderType = z.infer<typeof uploaderTypeSchema>
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>
export type MediaOutput = z.infer<typeof mediaOutputSchema>

// Helper function to determine media type from MIME type
export function getMediaTypeFromMime(mimeType: string): MediaType {
  return mimeType.startsWith('image/') ? 'photo' : 'video'
}

// Helper function to check if MIME type is allowed
export function isAllowedMediaType(mimeType: string): boolean {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(mimeType)
}
