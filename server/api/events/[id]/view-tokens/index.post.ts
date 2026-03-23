import { db } from '~/server/utils/db'
import { throwNotFoundError } from '~/server/utils/errors'
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

  // Parse optional mediaIds from request body
  const body = await readBody(event).catch(() => ({}))
  const mediaIds = Array.isArray(body?.mediaIds) ? body.mediaIds : undefined

  // Create view token
  const viewToken = await db.viewTokens.create(eventId, mediaIds)

  return createdResponse(event, viewToken)
})
