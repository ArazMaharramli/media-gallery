import { db } from '~/server/utils/db'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')

  if (!token) {
    throwNotFoundError('Guest access')
  }

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

  // Only include media if canView is enabled
  if (guestToken.canView) {
    let media: any[]

    // Get media based on mediaIds filter
    if (guestToken.mediaIds && guestToken.mediaIds.length > 0) {
      // Selective sharing - only return specified media
      media = await db.media.findByIds(guestToken.mediaIds)
    } else {
      // All media for the event
      media = await db.media.findByEventId(guestToken.eventId)
    }

    response.media = media
  }

  return successResponse(event, response)
})
