import { db } from '~/server/utils/db'
import { throwNotFoundError, throwForbiddenError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  const mediaId = getRouterParam(event, 'mediaId')

  if (!token || !mediaId) {
    throwNotFoundError('Media')
  }

  // Find the guest token
  const guestToken = await db.guestTokens.findByToken(token)
  if (!guestToken || !guestToken.active) {
    throwNotFoundError('Guest access')
  }

  // Check if token has expired
  if (guestToken.expiresAt && new Date() > guestToken.expiresAt) {
    throwNotFoundError('Guest access')
  }

  // Find the media item
  const media = await db.media.findById(mediaId)
  if (!media) {
    throwNotFoundError('Media', mediaId)
  }

  // Verify media belongs to the same event as the token
  if (media.eventId !== guestToken.eventId) {
    throwForbiddenError('You do not have permission to delete this media')
  }

  // Check if this is the guest's own upload (they can always delete their own)
  const isOwnUpload = media.guestTokenId === guestToken.id

  if (!isOwnUpload) {
    // For shared media, check canDelete permission
    if (!guestToken.canDelete) {
      throwForbiddenError('You do not have permission to delete shared media')
    }

    // If token has mediaIds restriction, verify media is in the allowed list
    if (guestToken.mediaIds && guestToken.mediaIds.length > 0) {
      if (!guestToken.mediaIds.includes(mediaId)) {
        throwForbiddenError('You do not have permission to delete this media')
      }
    }
  }

  // Delete the media
  const deleted = await db.media.delete(mediaId)
  if (!deleted) {
    throwNotFoundError('Media', mediaId)
  }

  return successResponse(event, { deleted: true })
})
