import { db } from '~/server/utils/db'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  const tokenId = getRouterParam(event, 'tokenId')

  if (!eventId) {
    throwNotFoundError('Event')
  }

  if (!tokenId) {
    throwNotFoundError('Upload token')
  }

  // Verify event exists
  const eventData = await db.events.findById(eventId)
  if (!eventData) {
    throwNotFoundError('Event', eventId)
  }

  // Deactivate the token
  const success = await db.uploadTokens.deactivate(tokenId)

  if (!success) {
    throwNotFoundError('Upload token', tokenId)
  }

  // Return the updated token list
  const uploadTokens = await db.uploadTokens.findByEventId(eventId)

  return successResponse(event, { deactivated: true, uploadTokens })
})
