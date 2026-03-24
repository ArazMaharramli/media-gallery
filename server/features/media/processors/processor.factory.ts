/**
 * Media processor factory
 * Returns the appropriate processor based on MIME type
 */
import { imageProcessor } from './image.processor'
import { videoProcessor } from './video.processor'
import type { MediaProcessor } from './processor.interface'

// Register all available processors
const processors: MediaProcessor[] = [
  imageProcessor,
  videoProcessor
]

/**
 * Get the appropriate processor for a given MIME type
 * @param mimeType - The MIME type of the file
 * @returns The processor that can handle this type, or null if unsupported
 */
export function getProcessor(mimeType: string): MediaProcessor | null {
  return processors.find(p => p.canProcess(mimeType)) ?? null
}

/**
 * Check if a MIME type is supported by any processor
 */
export function isProcessableType(mimeType: string): boolean {
  return processors.some(p => p.canProcess(mimeType))
}

/**
 * Get all supported MIME types
 */
export function getSupportedMimeTypes(): string[] {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm']
  return [...imageTypes, ...videoTypes]
}
