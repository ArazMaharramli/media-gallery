/**
 * Token management composable
 * Handles view tokens and upload tokens CRUD operations
 */
import { ref } from 'vue'

export interface ViewToken {
  id: string
  eventId: string
  token: string
  active: boolean
  mediaIds: string[]
  createdAt: string
}

export interface UploadToken {
  id: string
  eventId: string
  token: string
  name: string
  active: boolean
  createdAt: string
}

export function useTokenManagement(eventId: string) {
  // Loading states
  const isCreatingViewToken = ref(false)
  const isCreatingUploadToken = ref(false)
  const revokingTokenId = ref<string | null>(null)
  const deactivatingTokenId = ref<string | null>(null)

  // Error state
  const error = ref<string | null>(null)

  /**
   * Create a new view token for sharing gallery
   */
  async function createViewToken(mediaIds?: string[]): Promise<ViewToken | null> {
    isCreatingViewToken.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/events/${eventId}/view-tokens`, {
        method: 'POST',
        body: { mediaIds }
      }) as any

      return response.data
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Failed to create share link'
      return null
    } finally {
      isCreatingViewToken.value = false
    }
  }

  /**
   * Revoke a view token
   */
  async function revokeViewToken(tokenId: string): Promise<boolean> {
    revokingTokenId.value = tokenId
    error.value = null

    try {
      await $fetch(`/api/events/${eventId}/view-tokens/${tokenId}/revoke`, {
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
   * Create a new upload token
   */
  async function createUploadToken(name: string): Promise<UploadToken | null> {
    isCreatingUploadToken.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/events/${eventId}/upload-tokens`, {
        method: 'POST',
        body: { name }
      }) as any

      return response.data
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Failed to create upload link'
      return null
    } finally {
      isCreatingUploadToken.value = false
    }
  }

  /**
   * Deactivate an upload token
   */
  async function deactivateUploadToken(tokenId: string): Promise<boolean> {
    deactivatingTokenId.value = tokenId
    error.value = null

    try {
      await $fetch(`/api/events/${eventId}/upload-tokens/${tokenId}/deactivate`, {
        method: 'PATCH'
      })
      return true
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Failed to deactivate link'
      return false
    } finally {
      deactivatingTokenId.value = null
    }
  }

  /**
   * Generate full URL for a view token
   */
  function getViewTokenUrl(token: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/gallery/${token}`
    }
    return `/gallery/${token}`
  }

  /**
   * Generate full URL for an upload token
   */
  function getUploadTokenUrl(token: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/upload/${token}`
    }
    return `/upload/${token}`
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
    isCreatingViewToken,
    isCreatingUploadToken,
    revokingTokenId,
    deactivatingTokenId,
    error,

    // View token actions
    createViewToken,
    revokeViewToken,
    getViewTokenUrl,

    // Upload token actions
    createUploadToken,
    deactivateUploadToken,
    getUploadTokenUrl,

    // Utilities
    copyToClipboard
  }
}
