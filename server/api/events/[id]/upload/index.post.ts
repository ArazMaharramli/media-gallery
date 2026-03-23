import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { db } from '~/server/utils/db'
import { throwNotFoundError, throwValidationError } from '~/server/utils/errors'
import { createdResponse } from '~/server/utils/response'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

function getUploadDir(): string {
  const isProduction = process.cwd().includes('.output')
  if (isProduction) {
    return join(process.cwd(), '..', 'uploads')
  }
  return join(process.cwd(), 'uploads')
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
  if (!existsSync(eventDir)) {
    await mkdir(eventDir, { recursive: true })
  }

  // Save file
  const filePath = join(eventDir, filename)
  await writeFile(filePath, fileField.data)

  // Create media record
  const media = await db.media.create({
    eventId,
    uploadTokenId: null,
    filename,
    originalName,
    mimeType,
    size: fileField.data.length,
    storageKey,
    type: mediaType,
    uploadedBy: 'photographer'
  })

  return createdResponse(event, media)
})
