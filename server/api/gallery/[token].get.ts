import { db } from '~/server/utils/db'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throwNotFoundError('Gallery')
  }

  // Find the view token
  const viewToken = await db.viewTokens.findByToken(token)
  if (!viewToken) {
    throwNotFoundError('Gallery')
  }

  // Get the event data
  const eventData = await db.events.findById(viewToken.eventId)
  if (!eventData) {
    throwNotFoundError('Gallery')
  }

  // Get the media for this event
  const media = await db.media.findByEventId(viewToken.eventId)

  return successResponse(event, {
    event: {
      id: eventData.id,
      name: eventData.name,
      description: eventData.description,
      date: eventData.date
    },
    media
  })
})
