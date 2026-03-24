/**
 * Token validation schemas (view tokens and upload tokens)
 * Used by both client (Vue) and server (API handlers)
 */
import { z } from 'zod'
import { tokenSchema } from './common.schema'

// Create view token input
export const createViewTokenSchema = z.object({
  mediaIds: z
    .array(z.string().uuid())
    .optional()
    .describe('Optional list of specific media IDs to share. If empty, shares all media.')
})

// Create upload token input
export const createUploadTokenSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or less')
    .describe('Name/label for the uploader (e.g., "Uncle Bob", "Wedding Party")')
})

// View token output (from API)
export const viewTokenOutputSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  token: tokenSchema,
  active: z.boolean(),
  mediaIds: z.array(z.string().uuid()),
  createdAt: z.string()
})

// Upload token output (from API)
export const uploadTokenOutputSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  token: tokenSchema,
  name: z.string(),
  active: z.boolean(),
  createdAt: z.string()
})

// Token validation for URL params
export const tokenParamSchema = z.object({
  token: tokenSchema
})

// Types
export type CreateViewTokenInput = z.infer<typeof createViewTokenSchema>
export type CreateUploadTokenInput = z.infer<typeof createUploadTokenSchema>
export type ViewTokenOutput = z.infer<typeof viewTokenOutputSchema>
export type UploadTokenOutput = z.infer<typeof uploadTokenOutputSchema>
