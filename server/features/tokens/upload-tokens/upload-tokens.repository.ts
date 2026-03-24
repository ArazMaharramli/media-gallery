/**
 * Upload tokens repository
 * Handles all data access operations for UploadToken entities
 */
import { prisma } from '~/server/utils/prisma'
import { generateToken } from '~/server/shared/utils'
import type { UploadToken } from '@prisma/client'

export interface CreateUploadTokenData {
  eventId: string
  name: string
}

export const uploadTokensRepository = {
  /**
   * Find all upload tokens for an event
   */
  async findByEventId(eventId: string): Promise<UploadToken[]> {
    return prisma.uploadToken.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' }
    })
  },

  /**
   * Find an upload token by its token string
   */
  async findByToken(token: string): Promise<UploadToken | null> {
    return prisma.uploadToken.findUnique({
      where: { token }
    })
  },

  /**
   * Find an upload token by ID
   */
  async findById(id: string): Promise<UploadToken | null> {
    return prisma.uploadToken.findUnique({
      where: { id }
    })
  },

  /**
   * Create a new upload token
   */
  async create(data: CreateUploadTokenData): Promise<UploadToken> {
    const token = generateToken()
    return prisma.uploadToken.create({
      data: {
        eventId: data.eventId,
        token,
        name: data.name,
        active: true
      }
    })
  },

  /**
   * Deactivate an upload token
   */
  async deactivate(id: string): Promise<boolean> {
    try {
      await prisma.uploadToken.update({
        where: { id },
        data: { active: false }
      })
      return true
    } catch {
      return false
    }
  },

  /**
   * Reactivate an upload token
   */
  async activate(id: string): Promise<boolean> {
    try {
      await prisma.uploadToken.update({
        where: { id },
        data: { active: true }
      })
      return true
    } catch {
      return false
    }
  },

  /**
   * Delete an upload token
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.uploadToken.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  }
}

export type UploadTokensRepository = typeof uploadTokensRepository
