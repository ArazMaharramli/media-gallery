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
  if (!viewToken || !viewToken.active) {
    throwNotFoundError('Gallery')
  }

  // Get the event data
  const eventData = await db.events.findById(viewToken.eventId)
  if (!eventData) {
    throwNotFoundError('Gallery')
  }

  // Get the media for this event
  let media = await db.media.findByEventId(viewToken.eventId)

  // Filter by mediaIds if specified (selective sharing)
  if (viewToken.mediaIds && viewToken.mediaIds.length > 0) {
    const mediaIdSet = new Set(viewToken.mediaIds)
    media = media.filter((item: any) => mediaIdSet.has(item.id))
  }

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
