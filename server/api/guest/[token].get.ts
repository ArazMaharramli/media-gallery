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

  const guestToken = await guestTokensRepository.findByTokenWithEvent(token)
  if (!guestToken || !guestToken.active) {
    throwNotFoundError('Guest access')
  }

  if (guestToken.expiresAt && new Date() > guestToken.expiresAt) {
    throwNotFoundError('Guest access')
  }

  const response: {
    event: {
      id: string
      name: string
      description: string | null
      date: Date
    }
    permissions: {
      canView: boolean
      canUpload: boolean
      canDelete: boolean
    }
    tokenId: string
    tokenName: string | null
    media?: any[]
    ownUploads?: any[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasMore: boolean
    }
  } = {
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
    tokenName: guestToken.name
  }

  // Always fetch own uploads (not paginated)
  const ownUploads = await mediaRepository.findByGuestTokenId(guestToken.id)
  if (ownUploads.length > 0) {
    response.ownUploads = resolveMediaUrlsArray(ownUploads)
  }

  // Include shared media if canView (with pagination)
  if (guestToken.canView) {
    let media: any[]
    let total: number

    if (guestToken.mediaIds && guestToken.mediaIds.length > 0) {
      const allSelectedMedia = await mediaRepository.findByIds(guestToken.mediaIds)
      total = allSelectedMedia.length
      media = allSelectedMedia.slice(skip, skip + limit)
    } else {
      const [items, count] = await Promise.all([
        mediaRepository.findByEventId(guestToken.eventId, { skip, take: limit }),
        mediaRepository.countByEventId(guestToken.eventId)
      ])
      media = items
      total = count
    }

    response.media = resolveMediaUrlsArray(media)

    const totalPages = Math.ceil(total / limit)
    response.pagination = {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages
    }
  }

  return successResponse(event, response)
})
