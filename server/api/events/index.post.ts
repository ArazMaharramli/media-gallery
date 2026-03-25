import { eventsRepository } from '~/server/features/events'
import { throwValidationError } from '~/server/utils/errors'
import { createdResponse } from '~/server/utils/response'
import { createEventSchema } from '~/shared/schemas'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = createEventSchema.safeParse(body)
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
      const field = issue.path.join('.')
      fieldErrors[field] = fieldErrors[field] || []
      fieldErrors[field].push(issue.message)
    }
    throwValidationError('Validation failed', fieldErrors)
  }

  const validated = result.data
  const newEvent = await eventsRepository.create({
    name: validated.name.trim(),
    description: validated.description?.trim() || null,
    date: new Date(validated.date)
  })

  return createdResponse(event, newEvent)
})
