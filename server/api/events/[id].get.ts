import { requireEvent } from '~/server/shared/middleware'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const eventData = await requireEvent(event)
  return successResponse(event, eventData)
})
