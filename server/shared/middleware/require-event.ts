/**
 * Middleware to verify event exists and attach to context
 * Reduces duplicate code across API handlers
 */
import type { H3Event } from 'h3'
import type { Event } from '@prisma/client'
import { prisma } from '~/server/utils/prisma'
import { throwNotFoundError } from '~/server/utils/errors'

// Extend H3Event context type
declare module 'h3' {
  interface H3EventContext {
    event?: Event
  }
}

/**
 * Validate that an event exists and attach it to the request context
 *
 * @param h3Event - The H3 event object
 * @returns The event data
 * @throws 404 Not Found if event doesn't exist
 *
 * @example
 * export default defineEventHandler(async (event) => {
 *   const eventData = await requireEvent(event)
 *   // eventData is guaranteed to exist
 * })
 */
export async function requireEvent(h3Event: H3Event): Promise<Event> {
  const eventId = getRouterParam(h3Event, 'id')

  if (!eventId) {
    throwNotFoundError('Event')
  }

  const eventData = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!eventData) {
    throwNotFoundError('Event', eventId)
  }

  // Attach to context for potential downstream use
  h3Event.context.event = eventData

  return eventData
}

/**
 * Get event from context (after requireEvent was called)
 * Throws if event is not in context
 */
export function getEventFromContext(h3Event: H3Event): Event {
  const eventData = h3Event.context.event
  if (!eventData) {
    throw new Error('Event not in context. Did you call requireEvent first?')
  }
  return eventData
}
