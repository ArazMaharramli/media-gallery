import { requireEvent } from '~/server/shared/middleware'
import { mediaRepository } from '~/server/features/media'
import { resolveMediaUrlsArray } from '~/server/shared/utils'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const eventData = await requireEvent(event)
  const query = getQuery(event)

  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const skip = (page - 1) * limit

  const { items, total } = await mediaRepository.findByEventIdWithCount(eventData.id, { skip, take: limit })

  const totalPages = Math.ceil(total / limit)
  const hasMore = page < totalPages

  return successResponse(event, {
    items: resolveMediaUrlsArray(items),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore
    }
  })
})
