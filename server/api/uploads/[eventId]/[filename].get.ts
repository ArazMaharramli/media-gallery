import { createReadStream, existsSync, statSync } from 'fs'
import { join, normalize, resolve } from 'path'
import { sendStream, setHeader, getQuery, getHeader } from 'h3'
import { storageService } from '~/server/shared/storage'

function supportsWebP(acceptHeader: string | undefined): boolean {
  return acceptHeader?.includes('image/webp') ?? false
}

function isVideoFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext || '')
}

/**
 * Validate that a filename is safe (no path traversal)
 */
function isSafeFilename(filename: string): boolean {
  const normalized = normalize(filename)
  return !normalized.includes('..') &&
         !normalized.startsWith('/') &&
         !normalized.includes('\\') &&
         normalized === filename
}

/**
 * Validate that the resolved path is within the allowed directory
 */
function isPathWithinDirectory(filePath: string, directory: string): boolean {
  const resolvedPath = resolve(filePath)
  const resolvedDirectory = resolve(directory)
  return resolvedPath.startsWith(resolvedDirectory + '/')
}

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'eventId')
  const filename = getRouterParam(event, 'filename')
  const query = getQuery(event)
  const variant = query.variant as string | undefined

  if (!eventId || !filename) {
    throw createError({
      statusCode: 404,
      message: 'File not found'
    })
  }

  // Security: Validate filename to prevent path traversal attacks
  if (!isSafeFilename(filename)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid filename'
    })
  }

  const eventDir = storageService.getEventDir(eventId)
  let targetPath = join(eventDir, filename)

  // Security: Verify the resolved path is within the event directory
  if (!isPathWithinDirectory(targetPath, eventDir)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid filename'
    })
  }

  // Handle variant requests (thumbnail or preview)
  if (variant === 'thumbnail' || variant === 'preview') {
    const baseName = filename.replace(/\.[^/.]+$/, '')
    const acceptHeader = getHeader(event, 'accept')
    const isVideo = isVideoFile(filename)

    if (variant === 'thumbnail') {
      const useWebP = supportsWebP(acceptHeader)
      const variantFilename = useWebP ? `${baseName}_thumb.webp` : `${baseName}_thumb.jpg`
      const variantPath = join(eventDir, variantFilename)
      if (existsSync(variantPath)) {
        targetPath = variantPath
      }
    } else if (variant === 'preview') {
      if (isVideo) {
        const webmPath = join(eventDir, `${baseName}_preview.webm`)
        const mp4Path = join(eventDir, `${baseName}_preview.mp4`)

        if (existsSync(webmPath)) {
          targetPath = webmPath
        } else if (existsSync(mp4Path)) {
          targetPath = mp4Path
        }
      } else {
        const useWebP = supportsWebP(acceptHeader)
        const variantFilename = useWebP ? `${baseName}_preview.webp` : `${baseName}_preview.jpg`
        const variantPath = join(eventDir, variantFilename)
        if (existsSync(variantPath)) {
          targetPath = variantPath
        }
      }
    }
  }

  if (!existsSync(targetPath)) {
    throw createError({
      statusCode: 404,
      message: 'File not found'
    })
  }

  const stat = statSync(targetPath)
  const ext = targetPath.split('.').pop()?.toLowerCase()

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm'
  }

  const contentType = mimeTypes[ext || ''] || 'application/octet-stream'
  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Content-Length', stat.size)
  setHeader(event, 'Cache-Control', 'public, max-age=31536000')

  const stream = createReadStream(targetPath)
  return sendStream(event, stream)
})
