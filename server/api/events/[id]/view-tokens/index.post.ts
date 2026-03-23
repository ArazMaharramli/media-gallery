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

  // Create view token
  const viewToken = await db.viewTokens.create(eventId)

  return createdResponse(event, viewToken)
})
