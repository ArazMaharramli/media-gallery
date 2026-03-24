import { randomUUID } from 'crypto'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import { db } from '~/server/utils/db'
import { throwNotFoundError, throwValidationError, throwForbiddenError } from '~/server/utils/errors'
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
const VIDEO_PREVIEW_HEIGHT = 720
const VIDEO_PREVIEW_CRF = 28

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

  const thumbnailWebp = `${baseName}_thumb.webp`
  await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(join(eventDir, thumbnailWebp))

  const thumbnailJpeg = `${baseName}_thumb.jpg`
  await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toFile(join(eventDir, thumbnailJpeg))

  const previewWebp = `${baseName}_preview.webp`
  await sharp(buffer)
    .resize(PREVIEW_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(join(eventDir, previewWebp))

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

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: `${baseName}_temp_frame.png`,
        folder: eventDir,
        size: '?x720'
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
  })

  if (!existsSync(tempFramePath)) {
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

  const frameBuffer = await sharp(tempFramePath).toBuffer()

  const thumbnailWebp = `${baseName}_thumb.webp`
  await sharp(frameBuffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(join(eventDir, thumbnailWebp))

  const thumbnailJpeg = `${baseName}_thumb.jpg`
  await sharp(frameBuffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toFile(join(eventDir, thumbnailJpeg))

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

  const previewWebm = `${baseName}_preview.webm`
  const previewWebmPath = join(eventDir, previewWebm)

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        `-vf scale=-2:${VIDEO_PREVIEW_HEIGHT}`,
        '-c:v libvpx-vp9',
        `-crf ${VIDEO_PREVIEW_CRF}`,
        '-b:v 0',
        '-c:a libopus',
        '-b:a 128k'
      ])
      .output(previewWebmPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })

  const previewMp4 = `${baseName}_preview.mp4`
  const previewMp4Path = join(eventDir, previewMp4)

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        `-vf scale=-2:${VIDEO_PREVIEW_HEIGHT}`,
        '-c:v libx264',
        '-preset medium',
        `-crf ${VIDEO_PREVIEW_CRF}`,
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart'
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
  const token = getRouterParam(event, 'token')

  if (!token) {
    throwNotFoundError('Guest access')
  }

  // Find and validate guest token
  const guestToken = await db.guestTokens.findByTokenWithEvent(token)
  if (!guestToken || !guestToken.active) {
    throwNotFoundError('Guest access')
  }

  // Check if token has expired
  if (guestToken.expiresAt && new Date() > guestToken.expiresAt) {
    throwNotFoundError('Guest access')
  }

  // Check upload permission
  if (!guestToken.canUpload) {
    throwForbiddenError('You do not have permission to upload')
  }

  const eventId = guestToken.eventId

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

  if (!existsSync(eventDir)) {
    await mkdir(eventDir, { recursive: true })
  }

  // Save original file
  const filePath = join(eventDir, filename)
  await writeFile(filePath, fileField.data)

  // Generate variants
  let variants: {
    thumbnail?: string
    preview?: string
    thumbnailFallback?: string
    previewFallback?: string
  } = {}

  if (mediaType === 'photo') {
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

  // Create media record with guest token ID
  const media = await db.media.create({
    eventId,
    guestTokenId: guestToken.id,
    filename,
    originalName,
    mimeType,
    size: fileField.data.length,
    storageKey,
    type: mediaType,
    uploadedBy: 'guest',
    thumbnail: variants.thumbnail || null,
    thumbnailFallback: variants.thumbnailFallback || null,
    preview: variants.preview || null,
    previewFallback: variants.previewFallback || null
  })

  // Process video variants in background
  if (mediaType === 'video') {
    processVideoVariantsInBackground(media.id, filePath, eventDir, filename)
  }

  return createdResponse(event, media)
})

function processVideoVariantsInBackground(
  mediaId: string,
  videoPath: string,
  eventDir: string,
  filename: string
): void {
  setImmediate(async () => {
    try {
      console.log('[guest-video-processing] Starting for:', { mediaId, videoPath, filename })

      if (!existsSync(videoPath)) {
        console.error('[guest-video-processing] Video file not found:', videoPath)
        return
      }

      console.log('[guest-video-processing] Generating thumbnail...')
      const videoThumbnails = await generateVideoThumbnail(
        videoPath,
        eventDir,
        filename
      )

      console.log('[guest-video-processing] Generating preview videos...')
      const videoPreviews = await generateVideoPreview(
        videoPath,
        eventDir,
        filename
      )

      await db.media.update(mediaId, {
        thumbnail: videoThumbnails.thumbnail,
        thumbnailFallback: videoThumbnails.thumbnailFallback,
        preview: videoPreviews.preview,
        previewFallback: videoPreviews.previewFallback
      })

      console.log('[guest-video-processing] Complete for:', mediaId)
    } catch (err) {
      console.error('[guest-video-processing] Failed for:', mediaId, err)
    }
  })
}
