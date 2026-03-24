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

  async process(buffer: Buffer, options: ProcessOptions): Promise<ProcessedMedia> {
    const { outputDir, baseFilename } = options
    const baseName = baseFilename.replace(/\.[^/.]+$/, '')

    // Generate variants in parallel for better performance
    const [thumbnail, preview] = await Promise.all([
      this.generateThumbnail(buffer, outputDir, baseName),
      this.generatePreview(buffer, outputDir, baseName)
    ])

    return {
      thumbnail: thumbnail.webp,
      thumbnailFallback: thumbnail.jpeg,
      preview: preview.webp,
      previewFallback: preview.jpeg
    }
  }

  private async generateThumbnail(
    buffer: Buffer,
    outputDir: string,
    baseName: string
  ): Promise<{ webp: string; jpeg: string }> {
    const thumbnailWebp = `${baseName}_thumb.webp`
    const thumbnailJpeg = `${baseName}_thumb.jpg`

    await Promise.all([
      sharp(buffer)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(join(outputDir, thumbnailWebp)),
      sharp(buffer)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(join(outputDir, thumbnailJpeg))
    ])

    return { webp: thumbnailWebp, jpeg: thumbnailJpeg }
  }

  private async generatePreview(
    buffer: Buffer,
    outputDir: string,
    baseName: string
  ): Promise<{ webp: string; jpeg: string }> {
    const previewWebp = `${baseName}_preview.webp`
    const previewJpeg = `${baseName}_preview.jpg`

    await Promise.all([
      sharp(buffer)
        .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(join(outputDir, previewWebp)),
      sharp(buffer)
        .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(join(outputDir, previewJpeg))
    ])

    return { webp: previewWebp, jpeg: previewJpeg }
  }
}

export const imageProcessor = new ImageProcessor()
