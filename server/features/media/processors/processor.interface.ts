/**
 * Media processor interface
 * Defines the contract for processing different media types
 */

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
   * @param mimeType - The MIME type to check
   * @returns True if this processor can handle the type
   */
  canProcess(mimeType: string): boolean

  /**
   * Process media and generate variants (thumbnails, previews)
   * @param input - Buffer or file path depending on processor
   * @param options - Processing options
   * @returns Generated variant file paths
   */
  process(input: Buffer | string, options: ProcessOptions): Promise<ProcessedMedia>
}

// Settings shared across processors
export const THUMBNAIL_WIDTH = 300
export const PREVIEW_WIDTH = 1200
export const WEBP_QUALITY = 80
export const JPEG_QUALITY = 85
export const VIDEO_PREVIEW_HEIGHT = 720
export const VIDEO_PREVIEW_CRF = 28
