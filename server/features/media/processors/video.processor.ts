/**
 * Video processor
 * Generates thumbnails and compressed preview videos
 */
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'
import { existsSync } from 'fs'
import { unlink } from 'fs/promises'
import type { MediaProcessor, ProcessedMedia, ProcessOptions } from './processor.interface'
import {
  THUMBNAIL_WIDTH,
  WEBP_QUALITY,
  JPEG_QUALITY,
  VIDEO_PREVIEW_HEIGHT,
  VIDEO_PREVIEW_CRF
} from './processor.interface'

export class VideoProcessor implements MediaProcessor {
  private static SUPPORTED_TYPES = [
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]

  canProcess(mimeType: string): boolean {
    return VideoProcessor.SUPPORTED_TYPES.includes(mimeType)
  }

  /**
   * Process video: extract thumbnail and generate compressed preview
   * @param videoPath - Path to the video file (not buffer, since ffmpeg needs file path)
   * @param options - Processing options
   */
  async process(videoPath: string, options: ProcessOptions): Promise<ProcessedMedia> {
    const { outputDir, baseFilename } = options

    // Generate thumbnail from video frame
    const thumbnail = await this.generateThumbnail(videoPath, outputDir, baseFilename)

    // Generate compressed video previews
    const preview = await this.generatePreview(videoPath, outputDir, baseFilename)

    return {
      thumbnail: thumbnail.webp,
      thumbnailFallback: thumbnail.jpeg,
      preview: preview.webm,
      previewFallback: preview.mp4
    }
  }

  private async generateThumbnail(
    videoPath: string,
    outputDir: string,
    baseFilename: string
  ): Promise<{ webp: string; jpeg: string }> {
    const baseName = baseFilename.replace(/\.[^/.]+$/, '')
    const tempFramePath = join(outputDir, `${baseName}_temp_frame.png`)

    // Extract frame at 1 second (or 0 for very short videos)
    await this.extractFrame(videoPath, tempFramePath, outputDir, baseName, '00:00:01')

    // If first attempt failed, try at 0 seconds
    if (!existsSync(tempFramePath)) {
      await this.extractFrame(videoPath, tempFramePath, outputDir, baseName, '00:00:00')
    }

    if (!existsSync(tempFramePath)) {
      throw new Error('Failed to extract frame from video')
    }

    // Generate optimized thumbnails from the extracted frame
    const frameBuffer = await sharp(tempFramePath).toBuffer()

    const thumbnailWebp = `${baseName}_thumb.webp`
    const thumbnailJpeg = `${baseName}_thumb.jpg`

    await Promise.all([
      sharp(frameBuffer)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(join(outputDir, thumbnailWebp)),
      sharp(frameBuffer)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(join(outputDir, thumbnailJpeg))
    ])

    // Clean up temp frame
    await unlink(tempFramePath)

    return { webp: thumbnailWebp, jpeg: thumbnailJpeg }
  }

  private async extractFrame(
    videoPath: string,
    _tempPath: string,
    outputDir: string,
    baseName: string,
    timestamp: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: `${baseName}_temp_frame.png`,
          folder: outputDir,
          size: '?x720'
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
    })
  }

  private async generatePreview(
    videoPath: string,
    outputDir: string,
    baseFilename: string
  ): Promise<{ webm: string; mp4: string }> {
    const baseName = baseFilename.replace(/\.[^/.]+$/, '')

    const previewWebm = `${baseName}_preview.webm`
    const previewMp4 = `${baseName}_preview.mp4`

    // Generate both formats in parallel
    await Promise.all([
      this.generateWebmPreview(videoPath, join(outputDir, previewWebm)),
      this.generateMp4Preview(videoPath, join(outputDir, previewMp4))
    ])

    return { webm: previewWebm, mp4: previewMp4 }
  }

  private async generateWebmPreview(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          `-vf scale=-2:${VIDEO_PREVIEW_HEIGHT}`,
          '-c:v libvpx-vp9',
          `-crf ${VIDEO_PREVIEW_CRF}`,
          '-b:v 0',
          '-c:a libopus',
          '-b:a 128k'
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })
  }

  private async generateMp4Preview(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          `-vf scale=-2:${VIDEO_PREVIEW_HEIGHT}`,
          '-c:v libx264',
          '-preset medium',
          `-crf ${VIDEO_PREVIEW_CRF}`,
          '-c:a aac',
          '-b:a 128k',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })
  }
}

export const videoProcessor = new VideoProcessor()
