import { guestTokensRepository } from '~/server/features/tokens'
import { mediaRepository, mediaService } from '~/server/features/media'
import { throwNotFoundError, throwForbiddenError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  const mediaId = getRouterParam(event, 'mediaId')

  if (!token || !mediaId) {
    throwNotFoundError('Media')
  }

  const guestToken = await guestTokensRepository.findByToken(token)
  if (!guestToken || !guestToken.active) {
    throwNotFoundError('Guest access')
  }

  if (guestToken.expiresAt && new Date() > guestToken.expiresAt) {
    throwNotFoundError('Guest access')
  }

  const media = await mediaRepository.findById(mediaId)
  if (!media) {
    throwNotFoundError('Media', mediaId)
  }

  if (media.eventId !== guestToken.eventId) {
    throwForbiddenError('You do not have permission to delete this media')
  }

  const isOwnUpload = media.guestTokenId === guestToken.id

  if (!isOwnUpload) {
    if (!guestToken.canDelete) {
      throwForbiddenError('You do not have permission to delete shared media')
    }

    if (guestToken.mediaIds && guestToken.mediaIds.length > 0) {
      if (!guestToken.mediaIds.includes(mediaId)) {
        throwForbiddenError('You do not have permission to delete this media')
      }
    }
  }

  try {
    await mediaService.deleteMedia(mediaId)
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') {
      throwNotFoundError('Media', mediaId)
    }
    throw err
  }

  return successResponse(event, { deleted: true })
})
