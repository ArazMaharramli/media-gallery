import { requireEvent } from '~/server/shared/middleware'
import { mediaService } from '~/server/features/media'
import { resolveMediaUrls } from '~/server/shared/utils'
import { throwValidationError } from '~/server/utils/errors'
import { createdResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const eventData = await requireEvent(event)

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throwValidationError('No file provided')
  }

  const fileField = formData.find(field => field.name === 'file')
  if (!fileField || !fileField.data) {
    throwValidationError('No file provided')
  }

  const media = await mediaService.uploadMedia({
    eventId: eventData.id,
    buffer: fileField.data,
    mimeType: fileField.type || '',
    originalName: fileField.filename || 'unknown',
    uploadedBy: 'photographer'
  })

  return createdResponse(event, resolveMediaUrls(media))
})
