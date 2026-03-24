import { db } from '~/server/utils/db'
import { throwNotFoundError, throwValidationError } from '~/server/utils/errors'
import { createdResponse } from '~/server/utils/response'

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

  // Parse request body
  const body = await readBody(event).catch(() => ({}))

  // Validate at least one permission is enabled
  const canView = body?.canView ?? true
  const canUpload = body?.canUpload ?? false
  const canDelete = body?.canDelete ?? false

  if (!canView && !canUpload) {
    throwValidationError('At least one permission (canView or canUpload) must be enabled')
  }

  // Create guest token
  const guestToken = await db.guestTokens.create({
    eventId,
    name: body?.name,
    canView,
    canUpload,
    canDelete,
    mediaIds: Array.isArray(body?.mediaIds) ? body.mediaIds : undefined,
    expiresAt: body?.expiresAt ? new Date(body.expiresAt) : undefined
  })

  return createdResponse(event, guestToken)
})
