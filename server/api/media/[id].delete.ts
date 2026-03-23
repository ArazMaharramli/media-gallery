import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { db } from '~/server/utils/db'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

function getUploadDir(): string {
  const isProduction = process.cwd().includes('.output')
  if (isProduction) {
    return join(process.cwd(), '..', 'uploads')
  }
  return join(process.cwd(), 'uploads')
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFoundError('Media')
  }

  // Find the media record
  const media = await db.media.findById(id)
  if (!media) {
    throwNotFoundError('Media', id)
  }

  // Delete the file from storage
  const uploadDir = getUploadDir()
  const filePath = join(uploadDir, media.eventId, media.filename)

  if (existsSync(filePath)) {
    await unlink(filePath)
  }

  // Delete the database record
  await db.media.delete(id)

  return successResponse(event, { deleted: true })
})
