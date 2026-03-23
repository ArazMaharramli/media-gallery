import { db } from '~/server/utils/db'
import { throwValidationError } from '~/server/utils/errors'
import { createdResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Collect validation errors
  const errors: Record<string, string[]> = {}

  if (!body.name || typeof body.name !== 'string') {
    errors.name = ['Event name is required']
  } else if (body.name.length < 1 || body.name.length > 100) {
    errors.name = ['Event name must be between 1 and 100 characters']
  }

  if (!body.date) {
    errors.date = ['Event date is required']
  }

  if (body.description && body.description.length > 500) {
    errors.description = ['Description must be less than 500 characters']
  }

  // Throw if there are validation errors
  if (Object.keys(errors).length > 0) {
    throwValidationError('Validation failed', errors)
  }

  // Create event
  const newEvent = await db.events.create({
    name: body.name.trim(),
    description: body.description?.trim() || null,
    date: body.date
  })

  return createdResponse(event, newEvent)
})
