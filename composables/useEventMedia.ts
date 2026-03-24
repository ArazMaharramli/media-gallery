/**
 * Event media composable
 * Manages media fetching with pagination and CRUD operations
 */
import { ref, computed, onMounted, watch, type Ref } from 'vue'

export interface Media {
  id: string
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
  createdAt: string
}

export interface UseEventMediaOptions {
  itemsPerPage?: number
  autoFetch?: boolean
}

export function useEventMedia(eventId: string, options: UseEventMediaOptions = {}) {
  const { itemsPerPage = 20, autoFetch = true } = options

  // Media state
  const media = ref<Media[]>([])
  const currentPage = ref(1)
  const totalCount = ref(0)
  const hasMore = ref(true)

  // Loading states
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const isDeleting = ref(false)

  // Error state
  const error = ref<string | null>(null)

  // Computed
  const isEmpty = computed(() => media.value.length === 0)

  /**
   * Fetch media with pagination
   */
  async function fetchMedia(page: number = 1, append: boolean = false) {
    if (append) {
      isLoadingMore.value = true
    } else {
      isLoading.value = true
    }
    error.value = null

    try {
      const response = await $fetch(`/api/events/${eventId}/media`, {
        params: { page, limit: itemsPerPage }
      }) as any

      if (append) {
        media.value = [...media.value, ...response.data.items]
      } else {
        media.value = response.data.items
      }

      totalCount.value = response.data.pagination.total
      hasMore.value = response.data.pagination.hasMore
      currentPage.value = page
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Failed to load media'
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  /**
   * Load more media (for infinite scroll)
   */
  async function loadMore() {
    if (isLoadingMore.value || !hasMore.value) return
    await fetchMedia(currentPage.value + 1, true)
  }

  /**
   * Refresh media (reset to page 1)
   */
  async function refresh() {
    currentPage.value = 1
    hasMore.value = true
    await fetchMedia(1, false)
  }

  /**
   * Delete a single media item
   */
  async function deleteMedia(id: string): Promise<boolean> {
    isDeleting.value = true
    error.value = null

    try {
      await $fetch(`/api/media/${id}`, { method: 'DELETE' })

      // Remove from local state
      media.value = media.value.filter(m => m.id !== id)
      totalCount.value--

      return true
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Failed to delete media'
      return false
    } finally {
      isDeleting.value = false
    }
  }

  /**
   * Delete multiple media items
   */
  async function deleteMediaBatch(ids: string[]): Promise<number> {
    isDeleting.value = true
    error.value = null

    let deletedCount = 0

    for (const id of ids) {
      try {
        await $fetch(`/api/media/${id}`, { method: 'DELETE' })
        deletedCount++
      } catch {
        // Continue with other deletions
      }
    }

    // Remove deleted items from local state
    media.value = media.value.filter(m => !ids.includes(m.id))
    totalCount.value -= deletedCount

    isDeleting.value = false
    return deletedCount
  }

  /**
   * Get media URL with optional variant
   */
  function getMediaUrl(item: Media, variant?: 'thumbnail' | 'preview'): string {
    const baseUrl = `/api/uploads/${item.eventId}`

    if (variant === 'thumbnail' && item.thumbnail) {
      return `${baseUrl}/${item.thumbnail}`
    }
    if (variant === 'preview' && item.preview) {
      return `${baseUrl}/${item.preview}`
    }

    return `${baseUrl}/${item.filename}`
  }

  /**
   * Get thumbnail URL
   */
  function getThumbnailUrl(item: Media): string {
    return getMediaUrl(item, 'thumbnail')
  }

  /**
   * Get preview URL
   */
  function getPreviewUrl(item: Media): string {
    return getMediaUrl(item, 'preview')
  }

  /**
   * Get download URL (original file)
   */
  function getDownloadUrl(item: Media): string {
    return getMediaUrl(item)
  }

  /**
   * Set up intersection observer for infinite scroll
   */
  function setupInfiniteScroll(triggerElement: Ref<HTMLElement | null>) {
    watch(triggerElement, (el) => {
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore.value && !isLoadingMore.value) {
            loadMore()
          }
        },
        { rootMargin: '100px' }
      )

      observer.observe(el)
    }, { immediate: true })
  }

  // Auto fetch on mount
  if (autoFetch) {
    onMounted(() => {
      fetchMedia(1)
    })
  }

  return {
    // State
    media,
    currentPage,
    totalCount,
    hasMore,
    isLoading,
    isLoadingMore,
    isDeleting,
    error,
    isEmpty,

    // Actions
    fetchMedia,
    loadMore,
    refresh,
    deleteMedia,
    deleteMediaBatch,

    // URL helpers
    getMediaUrl,
    getThumbnailUrl,
    getPreviewUrl,
    getDownloadUrl,

    // Utils
    setupInfiniteScroll
  }
}
