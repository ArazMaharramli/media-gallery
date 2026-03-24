/**
 * Common validation rules shared across schemas
 */
import { z } from 'zod'

// ID validation
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Token validation (16 alphanumeric characters)
export const tokenSchema = z
  .string()
  .length(16, 'Token must be 16 characters')
  .regex(/^[a-zA-Z0-9]+$/, 'Token must be alphanumeric')

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

export type PaginationInput = z.infer<typeof paginationSchema>
