/**
 * Events repository
 * Handles all data access operations for Event entities
 */
import { prisma } from '~/server/utils/prisma'
import type { Event, Prisma } from '@prisma/client'

export interface CreateEventData {
  name: string
  date: Date
  description?: string | null
}

export const eventsRepository = {
  /**
   * Find all events, ordered by creation date (newest first)
   */
  async findMany(options?: {
    orderBy?: Prisma.EventOrderByWithRelationInput
  }): Promise<Event[]> {
    return prisma.event.findMany({
      orderBy: options?.orderBy ?? { createdAt: 'desc' }
    })
  },

  /**
   * Find a single event by ID
   */
  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({
      where: { id }
    })
  },

  /**
   * Create a new event
   */
  async create(data: CreateEventData): Promise<Event> {
    return prisma.event.create({
      data: {
        name: data.name,
        date: data.date,
        description: data.description ?? null
      }
    })
  },

  /**
   * Update an existing event
   */
  async update(
    id: string,
    data: Partial<CreateEventData>
  ): Promise<Event | null> {
    try {
      return await prisma.event.update({
        where: { id },
        data
      })
    } catch {
      return null
    }
  },

  /**
   * Delete an event
   * Note: Related records (media, tokens) are cascade deleted via Prisma schema
   */
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.event.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  }
}

export type EventsRepository = typeof eventsRepository
