/**
 * Image processor
 * Generates thumbnails and previews for image files
 */
import sharp from 'sharp'
import { join } from 'path'
import type { MediaProcessor, ProcessedMedia, ProcessOptions } from './processor.interface'
import {
  THUMBNAIL_WIDTH,
  PREVIEW_WIDTH,
  WEBP_QUALITY,
  JPEG_QUALITY
} from './processor.interface'

export class ImageProcessor implements MediaProcessor {
  private static SUPPORTED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]

  canProcess(mimeType: string): boolean {
    return ImageProcessor.SUPPORTED_TYPES.includes(mimeType)
  }

  /**
   * Process image and generate variants
   * @param input - Buffer or file path. File path is more memory-efficient for large images
   *                as Sharp streams the file instead of loading it entirely into memory.
   */
  async process(input: Buffer | string, options: ProcessOptions): Promise<ProcessedMedia> {
    const { outputDir, baseFilename } = options
    const baseName = baseFilename.replace(/\.[^/.]+$/, '')

    // Generate variants in parallel for better performance
    const [thumbnail, preview] = await Promise.all([
      this.generateThumbnail(input, outputDir, baseName),
      this.generatePreview(input, outputDir, baseName)
    ])

    return {
      thumbnail: thumbnail.webp,
      thumbnailFallback: thumbnail.jpeg,
      preview: preview.webp,
      previewFallback: preview.jpeg
    }
  }

  private async generateThumbnail(
    input: Buffer | string,
    outputDir: string,
    baseName: string
  ): Promise<{ webp: string; jpeg: string }> {
    const thumbnailWebp = `${baseName}_thumb.webp`
    const thumbnailJpeg = `${baseName}_thumb.jpg`

    // Sharp accepts both Buffer and file path - file path uses streaming (more memory efficient)
    await Promise.all([
      sharp(input)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(join(outputDir, thumbnailWebp)),
      sharp(input)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(join(outputDir, thumbnailJpeg))
    ])

    return { webp: thumbnailWebp, jpeg: thumbnailJpeg }
  }

  private async generatePreview(
    input: Buffer | string,
    outputDir: string,
    baseName: string
  ): Promise<{ webp: string; jpeg: string }> {
    const previewWebp = `${baseName}_preview.webp`
    const previewJpeg = `${baseName}_preview.jpg`

    await Promise.all([
      sharp(input)
        .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(join(outputDir, previewWebp)),
      sharp(input)
        .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(join(outputDir, previewJpeg))
    ])

    return { webp: previewWebp, jpeg: previewJpeg }
  }
}

export const imageProcessor = new ImageProcessor()
