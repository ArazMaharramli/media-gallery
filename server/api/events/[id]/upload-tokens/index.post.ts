import { db } from '~/server/utils/db'
import { throwNotFoundError, throwValidationError } from '~/server/utils/errors'
import { createdResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const eventId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!eventId) {
    throwNotFoundError('Event')
  }

  // Verify event exists
  const eventData = await db.events.findById(eventId)
  if (!eventData) {
    throwNotFoundError('Event', eventId)
  }

  // Validate request body
  const errors: Record<string, string[]> = {}

  if (!body.name || typeof body.name !== 'string') {
    errors.name = ['Name is required']
  } else if (body.name.trim().length < 1 || body.name.trim().length > 50) {
    errors.name = ['Name must be between 1 and 50 characters']
  }

  if (Object.keys(errors).length > 0) {
    throwValidationError('Validation failed', errors)
  }

  // Create upload token
  const uploadToken = await db.uploadTokens.create({
    eventId,
    name: body.name.trim()
  })

  return createdResponse(event, uploadToken)
})
