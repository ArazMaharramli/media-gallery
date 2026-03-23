import { db } from '~/server/utils/db'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

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

  // Get media for this event
  const media = await db.media.findByEventId(eventId)

  return successResponse(event, media)
})
