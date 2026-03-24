import { prisma } from './prisma'

// Helper to convert BigInt to number for JSON serialization
function serializeMedia(media: any) {
  if (!media) return media
  return {
    ...media,
    size: Number(media.size)
  }
}

export const db = {
  // Events
  events: {
    findMany: async () => {
      return prisma.event.findMany({
        orderBy: { createdAt: 'desc' }
      })
    },
    findById: async (id: string) => {
      return prisma.event.findUnique({
        where: { id }
      })
    },
    create: async (data: { name: string; description?: string | null; date: string }) => {
      return prisma.event.create({
        data: {
          name: data.name,
          description: data.description ?? null,
          date: new Date(data.date)
        }
      })
    },
    delete: async (id: string) => {
      try {
        await prisma.event.delete({
          where: { id }
        })
        return true
      } catch {
        return false
      }
    }
  },

  // Guest Tokens (unified view/upload tokens)
  guestTokens: {
    findByEventId: async (eventId: string) => {
      return prisma.guestToken.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' }
      })
    },
    findByToken: async (token: string) => {
      return prisma.guestToken.findUnique({
        where: { token }
      })
    },
    findByTokenWithEvent: async (token: string) => {
      return prisma.guestToken.findUnique({
        where: { token },
        include: { event: true }
      })
    },
    create: async (data: {
      eventId: string
      name?: string
      canView?: boolean
      canUpload?: boolean
      canDelete?: boolean
      mediaIds?: string[]
      expiresAt?: Date
    }) => {
      const token = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
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
    revoke: async (id: string) => {
      try {
        await prisma.guestToken.update({
          where: { id },
          data: { active: false }
        })
        return true
      } catch {
        return false
      }
    }
  },

  // Media
  media: {
    findById: async (id: string) => {
      const media = await prisma.media.findUnique({
        where: { id }
      })
      return serializeMedia(media)
    },
    findByEventId: async (eventId: string, options?: { skip?: number; take?: number }) => {
      const items = await prisma.media.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' },
        skip: options?.skip,
        take: options?.take
      })
      return items.map(serializeMedia)
    },
    findByIds: async (ids: string[]) => {
      const items = await prisma.media.findMany({
        where: { id: { in: ids } },
        orderBy: { createdAt: 'desc' }
      })
      return items.map(serializeMedia)
    },
    findByGuestTokenId: async (guestTokenId: string) => {
      const items = await prisma.media.findMany({
        where: { guestTokenId },
        orderBy: { createdAt: 'desc' }
      })
      return items.map(serializeMedia)
    },
    countByEventId: async (eventId: string) => {
      return prisma.media.count({
        where: { eventId }
      })
    },
    create: async (data: {
      eventId: string
      guestTokenId: string | null
      filename: string
      originalName: string
      mimeType: string
      size: number
      storageKey: string
      type: 'photo' | 'video'
      uploadedBy: 'photographer' | 'guest'
      thumbnail?: string | null
      thumbnailFallback?: string | null
      preview?: string | null
      previewFallback?: string | null
    }) => {
      const media = await prisma.media.create({
        data: {
          eventId: data.eventId,
          guestTokenId: data.guestTokenId,
          filename: data.filename,
          originalName: data.originalName,
          mimeType: data.mimeType,
          size: BigInt(data.size),
          storageKey: data.storageKey,
          type: data.type,
          uploadedBy: data.uploadedBy,
          thumbnail: data.thumbnail ?? null,
          thumbnailFallback: data.thumbnailFallback ?? null,
          preview: data.preview ?? null,
          previewFallback: data.previewFallback ?? null
        }
      })
      return serializeMedia(media)
    },
    delete: async (id: string) => {
      try {
        await prisma.media.delete({
          where: { id }
        })
        return true
      } catch {
        return false
      }
    },
    update: async (id: string, data: {
      thumbnail?: string | null
      thumbnailFallback?: string | null
      preview?: string | null
      previewFallback?: string | null
    }) => {
      const media = await prisma.media.update({
        where: { id },
        data
      })
      return serializeMedia(media)
    }
  }
}
