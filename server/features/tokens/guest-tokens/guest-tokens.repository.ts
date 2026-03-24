/**
 * Guest tokens repository
 * Handles all data access operations for GuestToken entities (unified view/upload tokens)
 */
import { prisma } from '~/server/utils/prisma'
import { generateToken } from '~/server/shared/utils'
import type { GuestToken } from '@prisma/client'

export interface CreateGuestTokenData {
  eventId: string
  name?: string
  canView?: boolean
  canUpload?: boolean
  canDelete?: boolean
  mediaIds?: string[]
  expiresAt?: Date
}

export const guestTokensRepository = {
  /**
   * Find all guest tokens for an event
   */
  async findByEventId(eventId: string): Promise<GuestToken[]> {
    return prisma.guestToken.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' }
    })
  },

  /**
   * Find a guest token by its token string
   */
  async findByToken(token: string): Promise<GuestToken | null> {
    return prisma.guestToken.findUnique({
      where: { token }
    })
  },

  /**
   * Find a guest token by its token string with event info
   */
  async findByTokenWithEvent(token: string) {
    return prisma.guestToken.findUnique({
      where: { token },
      include: { event: true }
    })
  },

  /**
   * Find a guest token by ID
   */
  async findById(id: string): Promise<GuestToken | null> {
    return prisma.guestToken.findUnique({
      where: { id }
    })
  },

  /**
   * Create a new guest token
   */
  async create(data: CreateGuestTokenData): Promise<GuestToken> {
    const token = generateToken()
    return prisma.guestToken.create({
      data: {
        eventId: data.eventId,
        token,
        name: data.name ?? null,
        active: true,
        canView: data.canView ?? true,
        canUpload: data.canUpload ?? false,
        canDelete: data.canDelete ?? false,
        mediaIds: data.mediaIds ?? [],
        expiresAt: data.expiresAt ?? null
      }
    })
  },

  /**
   * Revoke (deactivate) a guest token
   */
  async revoke(id: string): Promise<boolean> {
    try {
      await prisma.guestToken.update({
        where: { id },
        data: { active: false }
      })
      return true
    } catch {
      return false
    }
  },

  /**
   * Reactivate a guest token
   */
  async activate(id: string): Promise<boolean> {
    try {
      await prisma.guestToken.update({
        where: { id },
        data: { active: true }
      })
      return true
    } catch {
      return false
    }
  },

  /**
   * Delete a guest token
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.guestToken.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  },

  /**
   * Check if a token is valid (exists, active, and not expired)
   */
  async isValid(token: string): Promise<boolean> {
    const guestToken = await prisma.guestToken.findUnique({
      where: { token }
    })

    if (!guestToken || !guestToken.active) {
      return false
    }

    if (guestToken.expiresAt && new Date() > guestToken.expiresAt) {
      return false
    }

    return true
  }
}

export type GuestTokensRepository = typeof guestTokensRepository
