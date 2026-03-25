import { guestTokensRepository } from '~/server/features/tokens'
import { mediaRepository } from '~/server/features/media'
import { resolveMediaUrlsArray } from '~/server/shared/utils'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  const query = getQuery(event)

  if (!token) {
    throwNotFoundError('Guest access')
  }

  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const skip = (page - 1) * limit
  const filterMine = query.filter === 'mine'

  const guestToken = await guestTokensRepository.findByTokenWithEvent(token)
  if (!guestToken?.active) {
    throwNotFoundError('Guest access')
  }

  if (guestToken.expiresAt && new Date() > guestToken.expiresAt) {
    throwNotFoundError('Guest access')
  }

  let media: any[] = []
  let total = 0

  if (filterMine || !guestToken.canView) {
    // Show only own uploads
    const result = await mediaRepository.findByGuestTokenId(guestToken.id, { skip, take: limit })
    media = result.items
    total = result.total
  } else if (guestToken.mediaIds?.length) {
    // Specific media assigned + own uploads (single query)
    const result = await mediaRepository.findByIdsOrGuestTokenId(
      guestToken.mediaIds,
      guestToken.id,
      { skip, take: limit }
    )
    media = result.items
    total = result.total
  } else {
    // Can view all event media
    const result = await mediaRepository.findByEventIdWithCount(guestToken.eventId, { skip, take: limit })
    media = result.items
    total = result.total
  }

  const totalPages = Math.ceil(total / limit)

  return successResponse(event, {
    event: {
      id: guestToken.event.id,
      name: guestToken.event.name,
      description: guestToken.event.description,
      date: guestToken.event.date
    },
    permissions: {
      canView: guestToken.canView,
      canUpload: guestToken.canUpload,
      canDelete: guestToken.canDelete
    },
    tokenId: guestToken.id,
    tokenName: guestToken.name,
    media: resolveMediaUrlsArray(media),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages
    }
  })
})
