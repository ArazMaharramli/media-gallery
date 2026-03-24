/**
 * Event validation schemas
 * Used by both client (Vue) and server (API handlers)
 */
import { z } from 'zod'

// Create event input
export const createEventSchema = z.object({
  name: z
    .string()
    .min(1, 'Event name is required')
    .max(100, 'Event name must be 100 characters or less'),
  date: z
    .string()
    .min(1, 'Event date is required')
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable()
})

// Update event input (partial)
export const updateEventSchema = createEventSchema.partial()

// Event output (from API)
export const eventOutputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  date: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
})

// Types
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type EventOutput = z.infer<typeof eventOutputSchema>
