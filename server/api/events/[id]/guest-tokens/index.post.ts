import { requireEvent } from '~/server/shared/middleware'
import { guestTokensRepository } from '~/server/features/tokens'
import { throwValidationError } from '~/server/utils/errors'
import { createdResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const eventData = await requireEvent(event)
  const body = await readBody(event).catch(() => ({}))

  const canView = body?.canView ?? true
  const canUpload = body?.canUpload ?? false
  const canDelete = body?.canDelete ?? false

  if (!canView && !canUpload) {
    throwValidationError('At least one permission (canView or canUpload) must be enabled')
  }

  const guestToken = await guestTokensRepository.create({
    eventId: eventData.id,
    name: body?.name,
    canView,
    canUpload,
    canDelete,
    mediaIds: Array.isArray(body?.mediaIds) ? body.mediaIds : undefined,
    expiresAt: body?.expiresAt ? new Date(body.expiresAt) : undefined
  })

  return createdResponse(event, guestToken)
})
