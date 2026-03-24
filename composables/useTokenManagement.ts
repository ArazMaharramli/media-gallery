/**
 * Token management composable
 * Handles guest token CRUD operations (unified view/upload tokens)
 */
import { ref } from 'vue'

export interface GuestToken {
  id: string
  eventId: string
  token: string
  name: string | null
  active: boolean
  canView: boolean
  canUpload: boolean
  canDelete: boolean
  mediaIds: string[]
  expiresAt: string | null
  createdAt: string
}

export interface CreateGuestTokenInput {
  name?: string
  canView?: boolean
  canUpload?: boolean
  canDelete?: boolean
  mediaIds?: string[]
  expiresAt?: string
}

export function useTokenManagement(eventId: string) {
  // Loading states
  const isCreatingToken = ref(false)
  const revokingTokenId = ref<string | null>(null)

  // Error state
  const error = ref<string | null>(null)

  /**
   * Create a new guest token
   */
  async function createGuestToken(options: CreateGuestTokenInput = {}): Promise<GuestToken | null> {
    isCreatingToken.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/events/${eventId}/guest-tokens`, {
        method: 'POST',
        body: {
          name: options.name,
          canView: options.canView ?? true,
          canUpload: options.canUpload ?? false,
          canDelete: options.canDelete ?? false,
          mediaIds: options.mediaIds,
          expiresAt: options.expiresAt
        }
      }) as any

      return response.data
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Failed to create guest link'
      return null
    } finally {
      isCreatingToken.value = false
    }
  }

  /**
   * Revoke a guest token
   */
  async function revokeGuestToken(tokenId: string): Promise<boolean> {
    revokingTokenId.value = tokenId
    error.value = null

    try {
      await $fetch(`/api/events/${eventId}/guest-tokens/${tokenId}/revoke`, {
        method: 'PATCH'
      })
      return true
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Failed to revoke link'
      return false
    } finally {
      revokingTokenId.value = null
    }
  }

  /**
   * Generate full URL for a guest token
   */
  function getGuestTokenUrl(token: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/guest/${token}`
    }
    return `/guest/${token}`
  }

  /**
   * Copy text to clipboard
   */
  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  return {
    // State
    isCreatingToken,
    revokingTokenId,
    error,

    // Actions
    createGuestToken,
    revokeGuestToken,
    getGuestTokenUrl,

    // Utilities
    copyToClipboard
  }
}
