/**
 * Media feature module
 */
export {
  mediaRepository,
  type MediaRepository,
  type CreateMediaData,
  type UpdateMediaData,
  type PaginationOptions,
  type SerializedMedia
} from './media.repository'

// Service
export {
  mediaService,
  type MediaService,
  type UploadMediaInput,
  type UploadMediaResult
} from './media.service'

// Processors
export {
  getProcessor,
  isProcessableType,
  getSupportedMimeTypes,
  imageProcessor,
  videoProcessor,
  type MediaProcessor,
  type ProcessedMedia,
  type ProcessOptions
} from './processors'
