import { requireEvent } from '~/server/shared/middleware'
import { guestTokensRepository } from '~/server/features/tokens'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const eventData = await requireEvent(event)
  const guestTokens = await guestTokensRepository.findByEventId(eventData.id)
  return successResponse(event, guestTokens)
})
