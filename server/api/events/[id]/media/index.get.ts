import { db } from '~/server/utils/db'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  const query = getQuery(event)

  if (!eventId) {
    throwNotFoundError('Event')
  }

  // Pagination parameters
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const skip = (page - 1) * limit

  // Verify event exists
  const eventData = await db.events.findById(eventId)
  if (!eventData) {
    throwNotFoundError('Event', eventId)
  }

  // Get total count and paginated media
  const [media, total] = await Promise.all([
    db.media.findByEventId(eventId, { skip, take: limit }),
    db.media.countByEventId(eventId)
  ])

  const totalPages = Math.ceil(total / limit)
  const hasMore = page < totalPages

  return successResponse(event, {
    items: media,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore
    }
  })
})
