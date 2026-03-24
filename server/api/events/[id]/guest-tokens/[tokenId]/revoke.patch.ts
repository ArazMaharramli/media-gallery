import { db } from '~/server/utils/db'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  const tokenId = getRouterParam(event, 'tokenId')

  if (!eventId || !tokenId) {
    throwNotFoundError('Guest token')
  }

  // Verify event exists
  const eventData = await db.events.findById(eventId)
  if (!eventData) {
    throwNotFoundError('Event', eventId)
  }

  // Revoke the guest token
  const success = await db.guestTokens.revoke(tokenId)
  if (!success) {
    throwNotFoundError('Guest token', tokenId)
  }

  return successResponse(event, { revoked: true })
})
