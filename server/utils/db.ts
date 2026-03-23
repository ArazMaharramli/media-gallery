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

  // Upload Tokens
  uploadTokens: {
    findByEventId: async (eventId: string) => {
      return prisma.uploadToken.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' }
      })
    },
    findByToken: async (token: string) => {
      return prisma.uploadToken.findUnique({
        where: { token }
      })
    },
    create: async (data: { eventId: string; name: string }) => {
      const token = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
      return prisma.uploadToken.create({
        data: {
          eventId: data.eventId,
          token,
          name: data.name,
          active: true
        }
      })
    },
    deactivate: async (id: string) => {
      try {
        await prisma.uploadToken.update({
          where: { id },
          data: { active: false }
        })
        return true
      } catch {
        return false
      }
    }
  },

  // View Tokens
  viewTokens: {
    findByEventId: async (eventId: string) => {
      return prisma.viewToken.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' }
      })
    },
    findByToken: async (token: string) => {
      return prisma.viewToken.findUnique({
        where: { token }
      })
    },
    create: async (eventId: string) => {
      const token = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
      return prisma.viewToken.create({
        data: {
          eventId,
          token
        }
      })
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
    findByEventId: async (eventId: string) => {
      const items = await prisma.media.findMany({
        where: { eventId },
        orderBy: { createdAt: 'desc' }
      })
      return items.map(serializeMedia)
    },
    create: async (data: {
      eventId: string
      uploadTokenId: string | null
      filename: string
      originalName: string
      mimeType: string
      size: number
      storageKey: string
      type: 'photo' | 'video'
      uploadedBy: 'photographer' | 'guest'
    }) => {
      const media = await prisma.media.create({
        data: {
          eventId: data.eventId,
          uploadTokenId: data.uploadTokenId,
          filename: data.filename,
          originalName: data.originalName,
          mimeType: data.mimeType,
          size: BigInt(data.size),
          storageKey: data.storageKey,
          type: data.type,
          uploadedBy: data.uploadedBy
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
    }
  }
}
