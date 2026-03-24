/**
 * Guest token validation schemas
 * Used by both client (Vue) and server (API handlers)
 */
import { z } from 'zod'
import { tokenSchema } from './common.schema'

// Create guest token input
export const createGuestTokenSchema = z.object({
  name: z
    .string()
    .max(50, 'Name must be 50 characters or less')
    .optional()
    .describe('Optional name/label for the link (e.g., "Uncle Bob", "Family Link")'),
  canView: z
    .boolean()
    .default(true)
    .describe('Allow viewing and downloading media'),
  canUpload: z
    .boolean()
    .default(false)
    .describe('Allow uploading new media'),
  canDelete: z
    .boolean()
    .default(false)
    .describe('Allow deleting own uploaded media'),
  mediaIds: z
    .array(z.string().uuid())
    .optional()
    .describe('Optional list of specific media IDs to share. If empty, shares all media.'),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .describe('Optional expiration date for the token')
})

// Guest token output (from API)
export const guestTokenOutputSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  token: tokenSchema,
  name: z.string().nullable(),
  active: z.boolean(),
  canView: z.boolean(),
  canUpload: z.boolean(),
  canDelete: z.boolean(),
  mediaIds: z.array(z.string().uuid()),
  expiresAt: z.string().nullable(),
  createdAt: z.string()
})

// Token validation for URL params
export const tokenParamSchema = z.object({
  token: tokenSchema
})

// Types
export type CreateGuestTokenInput = z.infer<typeof createGuestTokenSchema>
export type GuestTokenOutput = z.infer<typeof guestTokenOutputSchema>
