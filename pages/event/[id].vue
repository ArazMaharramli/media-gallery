<template>
  <div class="space-y-6">
    <!-- Event Header -->
    <EventHeader
      :event="event"
      :is-creating-token="isCreatingToken"
      :selected-count="selectedMediaIds.size"
      :selection-mode="selectionMode"
      @quick-share="quickShare"
      @open-share-modal="showCreateLinkModal = true"
    />

    <!-- Tabs -->
    <div class="bg-white rounded-lg shadow-sm border">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button
            v-if="media.length > 0"
            @click="activeTab = 'media'"
            class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'media' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Media
              <span class="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {{ totalMediaCount }}
              </span>
            </span>
          </button>
          <button
            @click="activeTab = 'upload'"
            class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'upload' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
              <span v-if="uploadQueue.filter(i => i.status === 'uploading' || i.status === 'pending').length > 0" class="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                {{ uploadQueue.filter(i => i.status === 'uploading' || i.status === 'pending').length }}
              </span>
            </span>
          </button>
          <button
            @click="activeTab = 'links'"
            class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'links' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Links
              <span v-if="activeGuestTokens.length > 0" class="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {{ activeGuestTokens.length }}
              </span>
            </span>
          </button>
        </nav>
      </div>

      <!-- Upload Tab Content -->
      <EventUploader
        v-if="activeTab === 'upload'"
        :upload-queue="uploadQueue"
        @add-files="addFilesToQueue"
        @cancel="cancelUpload"
        @retry="retryUpload"
        @remove="removeFromQueue"
        @clear-completed="clearCompleted"
      />

      <!-- Media Tab Content -->
      <EventMediaGrid
        v-if="activeTab === 'media'"
        :media="media"
        :guest-tokens="guestTokens"
        :view-mode="viewMode"
        :selection-mode="selectionMode"
        :selected-ids="selectedMediaIds"
        :is-loading-more="isLoadingMore"
        :has-more="hasMoreMedia"
        :total-count="totalMediaCount"
        @update:view-mode="viewMode = $event"
        @enter-selection-mode="toggleSelectionMode"
        @exit-selection-mode="toggleSelectionMode"
        @select-all="selectAll"
        @deselect-all="deselectAll"
        @toggle-selection="toggleMediaSelection"
        @open-lightbox="openLightbox"
        @confirm-delete="confirmDelete"
        @delete-selected="showBatchDeleteModal = true"
        @load-more="loadMoreMedia"
      />

      <!-- Links Tab Content -->
      <div v-if="activeTab === 'links'" class="p-6">
        <EventTokensGuestTokenList
          :tokens="activeGuestTokens"
          :revoking-id="revokingTokenId"
          @copy="copyGuestLink"
          @revoke="revokeGuestToken"
        />
      </div>
    </div>

    <!-- Image Lightbox -->
    <MediaLightbox
      :is-open="lightboxOpen && currentMedia?.type === 'photo'"
      :current-media="currentMediaWithEventId"
      :current-index="currentMediaIndex"
      :total-count="media.length"
      :has-prev="hasPrevMedia"
      :has-next="hasNextMedia"
      @close="closeLightbox"
      @prev="prevMedia"
      @next="nextMedia"
    />

    <!-- Video Player Modal -->
    <div
      v-if="lightboxOpen && currentMedia?.type === 'video'"
      class="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      @click.self="closeLightbox"
    >
      <button
        @click="closeLightbox"
        class="absolute top-4 right-4 p-2 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <a
        :href="getDownloadUrl(currentMedia)"
        :download="currentMedia?.originalName"
        class="absolute top-4 right-16 p-2 text-white hover:text-gray-300 z-10"
        title="Download"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>
      <button
        @click="confirmDelete(currentMedia)"
        class="absolute top-4 right-28 p-2 text-white hover:text-red-400 z-10"
        title="Delete"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      <video
        ref="videoPlayerRef"
        :src="getPreviewUrl(currentMedia)"
        controls
        autoplay
        class="max-h-[90vh] max-w-[90vw]"
      >
        Your browser does not support the video tag.
      </video>
    </div>

    <!-- Delete Confirmation Modal -->
    <CommonConfirmModal
      :is-open="showDeleteModal"
      title="Delete Media"
      :message="`Are you sure you want to delete ${mediaToDelete?.originalName}? This action cannot be undone.`"
      confirm-text="Delete"
      :is-loading="isDeleting"
      variant="danger"
      @confirm="deleteMedia"
      @cancel="closeDeleteModal"
    />

    <!-- Batch Delete Confirmation Modal -->
    <CommonConfirmModal
      :is-open="showBatchDeleteModal"
      :title="`Delete ${selectedMediaIds.size} Items`"
      :message="`Are you sure you want to delete ${selectedMediaIds.size} selected items? This action cannot be undone.`"
      :confirm-text="`Delete ${selectedMediaIds.size} Items`"
      :is-loading="isBatchDeleting"
      variant="danger"
      @confirm="batchDeleteMedia"
      @cancel="closeBatchDeleteModal"
    />

    <!-- Share Modal -->
    <EventTokensShareModal
      :is-open="showShareModal"
      :share-link="shareLink"
      :event-name="event?.name"
      @close="showShareModal = false"
    />

    <!-- Create Guest Link Modal -->
    <EventTokensCreateGuestTokenModal
      :is-open="showCreateLinkModal"
      :selected-media-ids="selectionMode ? Array.from(selectedMediaIds) : []"
      :is-submitting="isCreatingToken"
      :error="createLinkError"
      @close="closeCreateLinkModal"
      @submit="createGuestLink"
    />

    <!-- Toast Notification -->
    <CommonToast
      :show="showToast"
      :message="toastMessage"
      @hide="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
// Types
interface Media {
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

interface GuestToken {
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

interface UploadQueueItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
  abortController?: AbortController
}

interface CreateGuestTokenInput {
  name?: string
  canView: boolean
  canUpload: boolean
  canDelete: boolean
  mediaIds?: string[]
}

const route = useRoute()
const eventId = route.params.id as string

// Fetch event data
const { data: eventResponse, error } = await useFetch(`/api/events/${eventId}`)

if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'Event not found'
  })
}

const event = computed(() => eventResponse.value?.data)

// Fetch media with pagination
const media = ref<Media[]>([])
const currentPage = ref(1)
const totalMediaCount = ref(0)
const hasMoreMedia = ref(true)
const isLoadingMore = ref(false)

async function fetchMedia(page: number = 1, append: boolean = false) {
  if (append) {
    isLoadingMore.value = true
  }

  try {
    const response = await $fetch(`/api/events/${eventId}/media`, {
      params: { page, limit: 20 }
    }) as any

    if (append) {
      media.value = [...media.value, ...response.data.items]
    } else {
      media.value = response.data.items
    }

    totalMediaCount.value = response.data.pagination.total
    hasMoreMedia.value = response.data.pagination.hasMore
    currentPage.value = page
  } catch (err) {
    console.error('Failed to fetch media:', err)
  } finally {
    isLoadingMore.value = false
  }
}

async function loadMoreMedia() {
  if (isLoadingMore.value || !hasMoreMedia.value) return
  await fetchMedia(currentPage.value + 1, true)
}

async function refreshMedia() {
  currentPage.value = 1
  hasMoreMedia.value = true
  await fetchMedia(1, false)
}

// Fetch guest tokens
const { data: tokensResponse, refresh: refreshTokens } = await useFetch(`/api/events/${eventId}/guest-tokens`)
const guestTokens = computed<GuestToken[]>(() => (tokensResponse.value as any)?.data || [])
const activeGuestTokens = computed(() => guestTokens.value.filter(t => t.active))

// UI State
const activeTab = ref<'media' | 'upload' | 'links'>('media')
const viewMode = ref<'grid' | 'list'>('grid')
const showCreateLinkModal = ref(false)
const showShareModal = ref(false)
const showDeleteModal = ref(false)
const showBatchDeleteModal = ref(false)

// Lightbox state
const lightboxOpen = ref(false)
const currentMediaIndex = ref(0)
const videoPlayerRef = ref<HTMLVideoElement | null>(null)

const currentMedia = computed(() => media.value[currentMediaIndex.value])
const currentMediaWithEventId = computed(() => {
  if (!currentMedia.value) return null
  return { ...currentMedia.value, eventId }
})
const hasPrevMedia = computed(() => currentMediaIndex.value > 0)
const hasNextMedia = computed(() => currentMediaIndex.value < media.value.length - 1)

// Selection state
const selectionMode = ref(false)
const selectedMediaIds = ref<Set<string>>(new Set())

// Delete state
const mediaToDelete = ref<Media | null>(null)
const isDeleting = ref(false)
const isBatchDeleting = ref(false)

// Token management state
const isCreatingToken = ref(false)
const createLinkError = ref<string | null>(null)
const revokingTokenId = ref<string | null>(null)
const shareLink = ref('')

// Toast state
const showToast = ref(false)
const toastMessage = ref('')

// Upload queue state
const uploadQueue = ref<UploadQueueItem[]>([])
const isProcessingQueue = ref(false)

// Initialize
await fetchMedia(1)

if (media.value.length === 0) {
  activeTab.value = 'upload'
}

// Watch for empty media to switch tabs
watch(media, (newMedia) => {
  if (newMedia.length === 0 && activeTab.value === 'media') {
    activeTab.value = 'upload'
  }
})

// Toast helper
function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Media URL helpers
function getMediaUrl(item: Media | null | undefined, variant?: 'thumbnail' | 'preview'): string {
  if (!item) return ''
  const baseUrl = `/api/uploads/${item.eventId}`
  if (variant === 'thumbnail' && item.thumbnail) return `${baseUrl}/${item.thumbnail}`
  if (variant === 'preview' && item.preview) return `${baseUrl}/${item.preview}`
  return `${baseUrl}/${item.filename}`
}

function getPreviewUrl(item: Media | null | undefined): string {
  return getMediaUrl(item, 'preview')
}

function getDownloadUrl(item: Media | null | undefined): string {
  return getMediaUrl(item)
}

// Lightbox functions
function openLightbox(index: number) {
  currentMediaIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxOpen.value = false
  document.body.style.overflow = ''
  if (videoPlayerRef.value) {
    videoPlayerRef.value.pause()
  }
}

function prevMedia() {
  if (hasPrevMedia.value) currentMediaIndex.value--
}

function nextMedia() {
  if (hasNextMedia.value) currentMediaIndex.value++
}

function handleKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  switch (e.key) {
    case 'Escape': closeLightbox(); break
    case 'ArrowLeft': prevMedia(); break
    case 'ArrowRight': nextMedia(); break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

// Selection functions
function toggleSelectionMode() {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) selectedMediaIds.value.clear()
}

function toggleMediaSelection(id: string) {
  if (selectedMediaIds.value.has(id)) {
    selectedMediaIds.value.delete(id)
  } else {
    selectedMediaIds.value.add(id)
  }
  selectedMediaIds.value = new Set(selectedMediaIds.value)
}

function selectAll() {
  media.value.forEach(item => selectedMediaIds.value.add(item.id))
  selectedMediaIds.value = new Set(selectedMediaIds.value)
}

function deselectAll() {
  selectedMediaIds.value.clear()
  selectedMediaIds.value = new Set(selectedMediaIds.value)
}

// Delete functions
function confirmDelete(item: Media | null | undefined) {
  if (!item) return
  mediaToDelete.value = item
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  mediaToDelete.value = null
}

async function deleteMedia() {
  if (!mediaToDelete.value) return
  isDeleting.value = true

  try {
    await $fetch(`/api/media/${mediaToDelete.value.id}`, { method: 'DELETE' })
    if (lightboxOpen.value && currentMedia.value?.id === mediaToDelete.value.id) {
      closeLightbox()
    }
    await refreshMedia()
    closeDeleteModal()
  } catch (err) {
    console.error('Failed to delete media:', err)
  } finally {
    isDeleting.value = false
  }
}

function closeBatchDeleteModal() {
  showBatchDeleteModal.value = false
}

async function batchDeleteMedia() {
  if (selectedMediaIds.value.size === 0) return
  isBatchDeleting.value = true

  const idsToDelete = Array.from(selectedMediaIds.value)
  let deletedCount = 0

  try {
    for (const id of idsToDelete) {
      try {
        await $fetch(`/api/media/${id}`, { method: 'DELETE' })
        deletedCount++
      } catch (err) {
        console.error(`Failed to delete media ${id}:`, err)
      }
    }

    if (lightboxOpen.value && selectedMediaIds.value.has(currentMedia.value?.id || '')) {
      closeLightbox()
    }

    showToastMessage(`Deleted ${deletedCount} items`)
    selectionMode.value = false
    selectedMediaIds.value.clear()
    await refreshMedia()
  } finally {
    isBatchDeleting.value = false
    showBatchDeleteModal.value = false
  }
}

// Guest token management
function copyGuestLink(token: string) {
  const link = `${window.location.origin}/guest/${token}`
  navigator.clipboard.writeText(link)
  showToastMessage('Guest link copied to clipboard')
}

async function revokeGuestToken(tokenId: string) {
  revokingTokenId.value = tokenId
  try {
    await $fetch(`/api/events/${eventId}/guest-tokens/${tokenId}/revoke`, { method: 'PATCH' })
    await refreshTokens()
    showToastMessage('Guest link revoked')
  } catch (err) {
    console.error('Failed to revoke token:', err)
  } finally {
    revokingTokenId.value = null
  }
}

// Quick share - creates a view-only link immediately
async function quickShare() {
  isCreatingToken.value = true

  try {
    // If in selection mode with selected items, create selective sharing link
    const data: CreateGuestTokenInput = {
      canView: true,
      canUpload: false,
      canDelete: false
    }

    if (selectionMode.value && selectedMediaIds.value.size > 0) {
      data.mediaIds = Array.from(selectedMediaIds.value)
    }

    const response = await $fetch(`/api/events/${eventId}/guest-tokens`, {
      method: 'POST',
      body: data
    }) as any

    shareLink.value = `${window.location.origin}/guest/${response.data.token}`
    await navigator.clipboard.writeText(shareLink.value)

    if (data.mediaIds && data.mediaIds.length > 0) {
      showToastMessage(`Link created for ${data.mediaIds.length} items - copied to clipboard`)
      selectionMode.value = false
      selectedMediaIds.value.clear()
    } else {
      showToastMessage('Share link created and copied to clipboard')
    }

    showShareModal.value = true
    await refreshTokens()
  } catch (err: any) {
    showToastMessage(err.data?.error?.message || 'Failed to create share link')
  } finally {
    isCreatingToken.value = false
  }
}

async function createGuestLink(data: CreateGuestTokenInput) {
  isCreatingToken.value = true
  createLinkError.value = null

  try {
    const response = await $fetch(`/api/events/${eventId}/guest-tokens`, {
      method: 'POST',
      body: data
    }) as any

    shareLink.value = `${window.location.origin}/guest/${response.data.token}`
    await navigator.clipboard.writeText(shareLink.value)

    if (data.canView && data.mediaIds && data.mediaIds.length > 0) {
      showToastMessage(`Guest link created (${data.mediaIds.length} items)`)
    } else {
      showToastMessage('Guest link created and copied to clipboard')
    }

    // Clear selection if we used selected media
    if (selectionMode.value && data.mediaIds && data.mediaIds.length > 0) {
      selectionMode.value = false
      selectedMediaIds.value.clear()
    }

    showShareModal.value = true
    closeCreateLinkModal()
    await refreshTokens()
  } catch (err: any) {
    createLinkError.value = err.data?.error?.message || 'Failed to create guest link'
  } finally {
    isCreatingToken.value = false
  }
}

function closeCreateLinkModal() {
  showCreateLinkModal.value = false
  createLinkError.value = null
}

// File upload handling
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm'
]
const MAX_FILE_SIZE = 500 * 1024 * 1024

function addFilesToQueue(files: File[]) {
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) continue
    if (file.size > MAX_FILE_SIZE) continue

    uploadQueue.value.push({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
      progress: 0
    })
  }
  processQueue()
}

async function processQueue() {
  if (isProcessingQueue.value) return
  const pendingItem = uploadQueue.value.find(item => item.status === 'pending')
  if (!pendingItem) return

  isProcessingQueue.value = true
  await uploadFile(pendingItem)
  isProcessingQueue.value = false
  processQueue()
}

async function uploadFile(item: UploadQueueItem) {
  item.status = 'uploading'
  item.progress = 0
  item.abortController = new AbortController()

  const formData = new FormData()
  formData.append('file', item.file)

  try {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          item.progress = Math.round((e.loaded / e.total) * 100)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
        } else {
          try {
            const response = JSON.parse(xhr.responseText)
            reject(new Error(response.error?.message || 'Upload failed'))
          } catch {
            reject(new Error('Upload failed'))
          }
        }
      })

      xhr.addEventListener('error', () => reject(new Error('Network error')))
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))
      item.abortController!.signal.addEventListener('abort', () => xhr.abort())

      xhr.open('POST', `/api/events/${eventId}/upload`)
      xhr.send(formData)
    })

    item.status = 'completed'
    item.progress = 100
    await refreshMedia()
  } catch (err: any) {
    if (err.message === 'Upload cancelled') {
      removeFromQueue(item.id)
    } else {
      item.status = 'error'
      item.error = err.message || 'Upload failed'
    }
  }
}

function cancelUpload(id: string) {
  const item = uploadQueue.value.find(i => i.id === id)
  if (item?.abortController) {
    item.abortController.abort()
  }
}

function retryUpload(id: string) {
  const item = uploadQueue.value.find(i => i.id === id)
  if (item) {
    item.status = 'pending'
    item.progress = 0
    item.error = undefined
    processQueue()
  }
}

function removeFromQueue(id: string) {
  const index = uploadQueue.value.findIndex(i => i.id === id)
  if (index !== -1) {
    uploadQueue.value.splice(index, 1)
  }
}

function clearCompleted() {
  uploadQueue.value = uploadQueue.value.filter(i => i.status !== 'completed')
}

useHead({
  title: computed(() => event.value ? `${event.value.name} - Media Gallery` : 'Event Dashboard - Media Gallery')
})
</script>
