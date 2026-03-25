import { guestTokensRepository } from '~/server/features/tokens'
import { mediaService } from '~/server/features/media'
import { resolveMediaUrls } from '~/server/shared/utils'
import { throwNotFoundError, throwValidationError, throwForbiddenError } from '~/server/utils/errors'
import { createdResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throwNotFoundError('Guest access')
  }

  const guestToken = await guestTokensRepository.findByTokenWithEvent(token)
  if (!guestToken || !guestToken.active) {
    throwNotFoundError('Guest access')
  }

  if (guestToken.expiresAt && new Date() > guestToken.expiresAt) {
    throwNotFoundError('Guest access')
  }

  if (!guestToken.canUpload) {
    throwForbiddenError('You do not have permission to upload')
  }

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throwValidationError('No file provided')
  }

  const fileField = formData.find(field => field.name === 'file')
  if (!fileField || !fileField.data) {
    throwValidationError('No file provided')
  }

  const media = await mediaService.uploadMedia({
    eventId: guestToken.eventId,
    buffer: fileField.data,
    mimeType: fileField.type || '',
    originalName: fileField.filename || 'unknown',
    guestTokenId: guestToken.id,
    uploadedBy: 'guest'
  })

  return createdResponse(event, resolveMediaUrls(media))
})
