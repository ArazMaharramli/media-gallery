import { db } from '~/server/utils/db'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  const query = getQuery(event)

  if (!token) {
    throwNotFoundError('Guest access')
  }

  // Pagination parameters
  const page = Math.max(1, parseInt(query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20))
  const skip = (page - 1) * limit

  // Find the guest token with event info
  const guestToken = await db.guestTokens.findByTokenWithEvent(token)
  if (!guestToken || !guestToken.active) {
    throwNotFoundError('Guest access')
  }

  // Check if token has expired
  if (guestToken.expiresAt && new Date() > guestToken.expiresAt) {
    throwNotFoundError('Guest access')
  }

  // Build response based on permissions
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

  // Always fetch own uploads (media uploaded by this guest token) - not paginated
  const ownUploads = await db.media.findByGuestTokenId(guestToken.id)
  if (ownUploads.length > 0) {
    response.ownUploads = ownUploads
  }

  // Include shared media if canView is enabled (with pagination)
  if (guestToken.canView) {
    let media: any[]
    let total: number

    // Get media based on mediaIds filter
    if (guestToken.mediaIds && guestToken.mediaIds.length > 0) {
      // Selective sharing - only return specified media (paginated)
      const allSelectedMedia = await db.media.findByIds(guestToken.mediaIds)
      total = allSelectedMedia.length
      media = allSelectedMedia.slice(skip, skip + limit)
    } else {
      // All media for the event (paginated)
      const [items, count] = await Promise.all([
        db.media.findByEventId(guestToken.eventId, { skip, take: limit }),
        db.media.countByEventId(guestToken.eventId)
      ])
      media = items
      total = count
    }

    response.media = media

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
