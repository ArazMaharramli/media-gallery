import { db } from '~/server/utils/db'
import { throwValidationError, throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwValidationError('Event ID is required')
  }

  const eventData = await db.events.findById(id)

  if (!eventData) {
    throwNotFoundError('Event', id)
  }

  return successResponse(event, eventData)
})
