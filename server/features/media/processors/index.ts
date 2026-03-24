/**
 * Media processors module
 */
export type {
  MediaProcessor,
  ProcessedMedia,
  ProcessOptions
} from './processor.interface'

export {
  THUMBNAIL_WIDTH,
  PREVIEW_WIDTH,
  WEBP_QUALITY,
  JPEG_QUALITY,
  VIDEO_PREVIEW_HEIGHT,
  VIDEO_PREVIEW_CRF
} from './processor.interface'

export { ImageProcessor, imageProcessor } from './image.processor'
export { VideoProcessor, videoProcessor } from './video.processor'
export { getProcessor, isProcessableType, getSupportedMimeTypes } from './processor.factory'
