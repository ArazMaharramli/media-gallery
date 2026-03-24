/**
 * View tokens repository
 * Handles all data access operations for ViewToken entities
 */
import { prisma } from '~/server/utils/prisma'
import { generateToken } from '~/server/shared/utils'
import type { ViewToken } from '@prisma/client'

export interface CreateViewTokenData {
  eventId: string
  mediaIds?: string[]
}

export const viewTokensRepository = {
  /**
   * Find all view tokens for an event
   */
  async findByEventId(eventId: string): Promise<ViewToken[]> {
    return prisma.viewToken.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' }
    })
  },

  /**
   * Find a view token by its token string
   */
  async findByToken(token: string): Promise<ViewToken | null> {
    return prisma.viewToken.findUnique({
      where: { token }
    })
  },

  /**
   * Find a view token by ID
   */
  async findById(id: string): Promise<ViewToken | null> {
    return prisma.viewToken.findUnique({
      where: { id }
    })
  },

  /**
   * Create a new view token
   */
  async create(data: CreateViewTokenData): Promise<ViewToken> {
    const token = generateToken()
    return prisma.viewToken.create({
      data: {
        eventId: data.eventId,
        token,
        active: true,
        mediaIds: data.mediaIds ?? []
      }
    })
  },

  /**
   * Revoke (deactivate) a view token
   */
  async revoke(id: string): Promise<boolean> {
    try {
      await prisma.viewToken.update({
        where: { id },
        data: { active: false }
      })
      return true
    } catch {
      return false
    }
  },

  /**
   * Delete a view token
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.viewToken.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  }
}

export type ViewTokensRepository = typeof viewTokensRepository
