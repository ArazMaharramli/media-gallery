/**
 * Shared validation schemas
 * Used by both client (Vue) and server (API handlers)
 */

// Common
export {
  uuidSchema,
  tokenSchema,
  paginationSchema,
  type PaginationInput
} from './common.schema'

// Event
export {
  createEventSchema,
  updateEventSchema,
  eventOutputSchema,
  type CreateEventInput,
  type UpdateEventInput,
  type EventOutput
} from './event.schema'

// Media
export {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_MEDIA_TYPES,
  MAX_FILE_SIZE,
  mediaTypeSchema,
  uploaderTypeSchema,
  uploadMediaSchema,
  mediaOutputSchema,
  getMediaTypeFromMime,
  isAllowedMediaType,
  type MediaType,
  type UploaderType,
  type UploadMediaInput,
  type MediaOutput
} from './media.schema'

// Tokens
export {
  createViewTokenSchema,
  createUploadTokenSchema,
  viewTokenOutputSchema,
  uploadTokenOutputSchema,
  tokenParamSchema,
  type CreateViewTokenInput,
  type CreateUploadTokenInput,
  type ViewTokenOutput,
  type UploadTokenOutput
} from './token.schema'
