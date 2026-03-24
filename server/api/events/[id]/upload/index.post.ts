import { randomUUID } from 'crypto'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import { db } from '~/server/utils/db'
import { throwNotFoundError, throwValidationError } from '~/server/utils/errors'
import { createdResponse } from '~/server/utils/response'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

// Image variant settings
const THUMBNAIL_WIDTH = 300
const PREVIEW_WIDTH = 1200
const WEBP_QUALITY = 80
const JPEG_QUALITY = 85

// Video variant settings
const VIDEO_PREVIEW_HEIGHT = 720 // 720p for preview
const VIDEO_PREVIEW_CRF = 28 // Higher = more compression, lower quality (18-28 is good range)

function getUploadDir(): string {
  const isProduction = process.cwd().includes('.output')
  if (isProduction) {
    return join(process.cwd(), '..', 'uploads')
  }
  return join(process.cwd(), 'uploads')
}

async function generateImageVariants(
  buffer: Buffer,
  eventDir: string,
  baseFilename: string,
  _originalExt: string
): Promise<{ thumbnail: string; preview: string; thumbnailFallback: string; previewFallback: string }> {
  const baseName = baseFilename.replace(/\.[^/.]+$/, '')

  // Generate thumbnail (WebP)
  const thumbnailWebp = `${baseName}_thumb.webp`
  await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(join(eventDir, thumbnailWebp))

  // Generate thumbnail fallback (JPEG)
  const thumbnailJpeg = `${baseName}_thumb.jpg`
  await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toFile(join(eventDir, thumbnailJpeg))

  // Generate preview (WebP)
  const previewWebp = `${baseName}_preview.webp`
  await sharp(buffer)
    .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(join(eventDir, previewWebp))

  // Generate preview fallback (JPEG)
  const previewJpeg = `${baseName}_preview.jpg`
  await sharp(buffer)
    .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toFile(join(eventDir, previewJpeg))

  return {
    thumbnail: thumbnailWebp,
    preview: previewWebp,
    thumbnailFallback: thumbnailJpeg,
    previewFallback: previewJpeg
  }
}

async function generateVideoThumbnail(
  videoPath: string,
  eventDir: string,
  baseFilename: string
): Promise<{ thumbnail: string; thumbnailFallback: string }> {
  const baseName = baseFilename.replace(/\.[^/.]+$/, '')
  const tempFramePath = join(eventDir, `${baseName}_temp_frame.png`)

  // Extract a frame from the video at 1 second (or first frame if shorter)
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: `${baseName}_temp_frame.png`,
        folder: eventDir,
        size: '?x720' // Scale to 720p height, maintain aspect ratio
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
  })

  // Check if frame was extracted (might fail for very short videos)
  if (!existsSync(tempFramePath)) {
    // Try extracting at 0 seconds for very short videos
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['00:00:00'],
          filename: `${baseName}_temp_frame.png`,
          folder: eventDir,
          size: '?x720'
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
    })
  }

  if (!existsSync(tempFramePath)) {
    throw new Error('Failed to extract frame from video')
  }

  // Read the extracted frame and generate optimized thumbnails
  const frameBuffer = await sharp(tempFramePath).toBuffer()

  // Generate thumbnail (WebP)
  const thumbnailWebp = `${baseName}_thumb.webp`
  await sharp(frameBuffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(join(eventDir, thumbnailWebp))

  // Generate thumbnail fallback (JPEG)
  const thumbnailJpeg = `${baseName}_thumb.jpg`
  await sharp(frameBuffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toFile(join(eventDir, thumbnailJpeg))

  // Clean up temp frame
  await unlink(tempFramePath)

  return {
    thumbnail: thumbnailWebp,
    thumbnailFallback: thumbnailJpeg
  }
}

async function generateVideoPreview(
  videoPath: string,
  eventDir: string,
  baseFilename: string
): Promise<{ preview: string; previewFallback: string }> {
  const baseName = baseFilename.replace(/\.[^/.]+$/, '')

  // Generate WebM preview (next-gen format, better compression)
  const previewWebm = `${baseName}_preview.webm`
  const previewWebmPath = join(eventDir, previewWebm)

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        `-vf scale=-2:${VIDEO_PREVIEW_HEIGHT}`, // Scale to 720p, maintain aspect ratio
        '-c:v libvpx-vp9', // VP9 codec for WebM
        `-crf ${VIDEO_PREVIEW_CRF}`,
        '-b:v 0', // Variable bitrate
        '-c:a libopus', // Opus audio codec
        '-b:a 128k'
      ])
      .output(previewWebmPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })

  // Generate MP4 preview (fallback for older browsers)
  const previewMp4 = `${baseName}_preview.mp4`
  const previewMp4Path = join(eventDir, previewMp4)

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        `-vf scale=-2:${VIDEO_PREVIEW_HEIGHT}`, // Scale to 720p, maintain aspect ratio
        '-c:v libx264', // H.264 codec for MP4
        '-preset medium', // Encoding speed/quality tradeoff
        `-crf ${VIDEO_PREVIEW_CRF}`,
        '-c:a aac', // AAC audio codec
        '-b:a 128k',
        '-movflags +faststart' // Enable fast start for web playback
      ])
      .output(previewMp4Path)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })

  return {
    preview: previewWebm,
    previewFallback: previewMp4
  }
}

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')

  if (!eventId) {
    throwNotFoundError('Event')
  }

  // Verify event exists
  const eventData = await db.events.findById(eventId)
  if (!eventData) {
    throwNotFoundError('Event', eventId)
  }

  // Parse multipart form data
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throwValidationError('No file provided')
  }

  const fileField = formData.find(field => field.name === 'file')
  if (!fileField || !fileField.data) {
    throwValidationError('No file provided')
  }

  const mimeType = fileField.type || ''
  const originalName = fileField.filename || 'unknown'

  // Validate file type
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throwValidationError('Invalid file type', {
      file: [`Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, WEBM`]
    })
  }

  // Validate file size
  if (fileField.data.length > MAX_FILE_SIZE) {
    throwValidationError('File too large', {
      file: [`Maximum file size is 500MB`]
    })
  }

  // Determine media type
  const mediaType = ALLOWED_IMAGE_TYPES.includes(mimeType) ? 'photo' : 'video'

  // Generate unique filename
  const ext = originalName.split('.').pop() || (mediaType === 'photo' ? 'jpg' : 'mp4')
  const filename = `${randomUUID()}.${ext}`
  const storageKey = `${eventId}/${filename}`

  // Ensure upload directory exists
  const uploadDir = getUploadDir()
  const eventDir = join(uploadDir, eventId)
  console.log('Upload directory:', uploadDir)
  console.log('Event directory:', eventDir)

  if (!existsSync(eventDir)) {
    console.log('Creating event directory:', eventDir)
    await mkdir(eventDir, { recursive: true })
  }

  // Save original file
  const filePath = join(eventDir, filename)
  console.log('Saving file to:', filePath)
  await writeFile(filePath, fileField.data)
  console.log('File saved successfully, size:', fileField.data.length)

  // Generate variants for images (sync) or videos (async background)
  let variants: {
    thumbnail?: string
    preview?: string
    thumbnailFallback?: string
    previewFallback?: string
  } = {}

  if (mediaType === 'photo') {
    // Image processing is fast, do it synchronously
    try {
      variants = await generateImageVariants(
        fileField.data,
        eventDir,
        filename,
        ext
      )
    } catch (err) {
      console.error('Failed to generate image variants:', err)
    }
  }

  // Create media record immediately (for videos, variants will be updated later)
  const media = await db.media.create({
    eventId,
    uploadTokenId: null,
    filename,
    originalName,
    mimeType,
    size: fileField.data.length,
    storageKey,
    type: mediaType,
    uploadedBy: 'photographer',
    thumbnail: variants.thumbnail || null,
    thumbnailFallback: variants.thumbnailFallback || null,
    preview: variants.preview || null,
    previewFallback: variants.previewFallback || null
  })

  // For videos, process variants in background and update record when done
  if (mediaType === 'video') {
    processVideoVariantsInBackground(media.id, filePath, eventDir, filename)
  }

  return createdResponse(event, media)
})

// Background video processing - doesn't block the response
async function processVideoVariantsInBackground(
  mediaId: string,
  videoPath: string,
  eventDir: string,
  filename: string
): Promise<void> {
  try {
    console.log('Starting background video processing for:', videoPath)

    // Generate thumbnail
    const videoThumbnails = await generateVideoThumbnail(
      videoPath,
      eventDir,
      filename
    )
    console.log('Video thumbnail generated:', videoThumbnails.thumbnail)

    // Generate compressed previews
    console.log('Generating video preview for:', videoPath)
    const videoPreviews = await generateVideoPreview(
      videoPath,
      eventDir,
      filename
    )
    console.log('Video preview generated:', videoPreviews.preview)

    // Update database with variant paths
    await db.media.update(mediaId, {
      thumbnail: videoThumbnails.thumbnail,
      thumbnailFallback: videoThumbnails.thumbnailFallback,
      preview: videoPreviews.preview,
      previewFallback: videoPreviews.previewFallback
    })

    console.log('Video processing complete for:', mediaId)
  } catch (err) {
    console.error('Background video processing failed:', err)
    // Record stays without variants - original will be used as fallback
  }
}
