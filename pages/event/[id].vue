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
              <span v-if="activeUploadsCount > 0" class="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                {{ activeUploadsCount }}
              </span>
              <span
                v-else-if="resumableUploads && resumableUploads.length > 0"
                class="w-2 h-2 bg-amber-500 rounded-full"
                title="Incomplete uploads"
              ></span>
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
      <div v-if="activeTab === 'upload'" class="p-6">
        <EventUploader
          :upload-queue="uploadQueue"
          :resumable-uploads="resumableUploads"
          @add-files="addFilesToQueue"
          @cancel="cancelUpload"
          @pause="pauseUpload"
          @resume="resumeUpload"
          @retry="retryUpload"
          @remove="removeFromQueue"
          @clear-completed="clearCompleted"
          @dismiss-resumable="dismissResumableUpload"
          @clear-resumable="clearResumableUploads"
        />
      </div>

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
      :current-media="currentMedia"
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
        :href="currentMedia?.filename"
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
        :src="currentMedia?.preview || currentMedia?.filename"
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
import type { MediaOutput, CreateGuestTokenInput } from '~/shared/schemas'

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

// Composables
const {
  media, totalCount: totalMediaCount, hasMore: hasMoreMedia,
  isLoadingMore, fetchMedia, loadMore: loadMoreMedia, refresh: refreshMedia
} = useEventMedia(eventId, { autoFetch: false })

const {
  isOpen: lightboxOpen, currentIndex: currentMediaIndex,
  currentItem: currentMedia, hasPrev: hasPrevMedia, hasNext: hasNextMedia,
  videoPlayerRef, open: openLightbox, close: closeLightbox,
  prev: prevMedia, next: nextMedia
} = useLightbox(media)

const {
  isSelectionMode: selectionMode, selectedIds: selectedMediaIds,
  toggleSelectionMode, toggleSelection: toggleMediaSelection,
  selectAll, deselectAll
} = useMediaSelection(media)

const {
  uploadQueue, addFiles: addFilesToQueue, cancelUpload,
  pauseUpload, resumeUpload, retryUpload, removeFromQueue, clearCompleted,
  resumableUploads, dismissResumableUpload, clearResumableUploads
} = useMediaUpload(`/api/events/${eventId}/upload`, refreshMedia, {
  metadata: { eventId }
})

// Computed property for active uploads count (avoids inline filter in template)
const activeUploadsCount = computed(() =>
  uploadQueue.value.filter(i => i.status === 'uploading' || i.status === 'pending' || i.status === 'paused').length
)

const {
  isCreatingToken, revokingTokenId,
  createGuestToken, revokeGuestToken: revokeTokenAction,
  getGuestTokenUrl, copyToClipboard
} = useTokenManagement(eventId)

// Fetch guest tokens
const { data: tokensResponse, refresh: refreshTokens } = await useFetch(`/api/events/${eventId}/guest-tokens`)
const guestTokens = computed(() => (tokensResponse.value as any)?.data || [])
const activeGuestTokens = computed(() => guestTokens.value.filter((t: any) => t.active))

// UI State
const activeTab = ref<'media' | 'upload' | 'links'>('media')
const viewMode = ref<'grid' | 'list'>('grid')
const showCreateLinkModal = ref(false)
const showShareModal = ref(false)
const showDeleteModal = ref(false)
const showBatchDeleteModal = ref(false)

// Delete state
const mediaToDelete = ref<MediaOutput | null>(null)
const isDeleting = ref(false)
const isBatchDeleting = ref(false)

// Share state
const createLinkError = ref<string | null>(null)
const shareLink = ref('')

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
let toastTimeout: ReturnType<typeof setTimeout> | null = null

// Cleanup on unmount
onUnmounted(() => {
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
})

// Initialize
await fetchMedia(1)

if (media.value.length === 0) {
  activeTab.value = 'upload'
}

watch(media, (newMedia) => {
  if (newMedia.length === 0 && activeTab.value === 'media') {
    activeTab.value = 'upload'
  }
})

// Toast helper
function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Delete functions
function confirmDelete(item: MediaOutput | null | undefined) {
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
    showToastMessage('Media deleted successfully')
  } catch (err: any) {
    showToastMessage(err.data?.error?.message || 'Failed to delete media')
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
      } catch {
        // Continue with other deletions
      }
    }

    if (lightboxOpen.value && selectedMediaIds.value.has(currentMedia.value?.id || '')) {
      closeLightbox()
    }

    showToastMessage(`Deleted ${deletedCount} items`)
    toggleSelectionMode()
    await refreshMedia()
  } finally {
    isBatchDeleting.value = false
    showBatchDeleteModal.value = false
  }
}

// Guest token management
function copyGuestLink(token: string) {
  const link = getGuestTokenUrl(token)
  copyToClipboard(link)
  showToastMessage('Guest link copied to clipboard')
}

async function revokeGuestToken(tokenId: string) {
  const success = await revokeTokenAction(tokenId)
  if (success) {
    await refreshTokens()
    showToastMessage('Guest link revoked')
  }
}

async function quickShare() {
  const data: CreateGuestTokenInput = {
    canView: true,
    canUpload: false,
    canDelete: false
  }

  if (selectionMode.value && selectedMediaIds.value.size > 0) {
    data.mediaIds = Array.from(selectedMediaIds.value)
  }

  const token = await createGuestToken(data)
  if (!token) return

  shareLink.value = getGuestTokenUrl(token.token)
  await copyToClipboard(shareLink.value)

  if (data.mediaIds && data.mediaIds.length > 0) {
    showToastMessage(`Link created for ${data.mediaIds.length} items - copied to clipboard`)
    toggleSelectionMode()
  } else {
    showToastMessage('Share link created and copied to clipboard')
  }

  showShareModal.value = true
  await refreshTokens()
}

async function createGuestLink(data: CreateGuestTokenInput) {
  createLinkError.value = null

  const token = await createGuestToken(data)
  if (!token) {
    createLinkError.value = 'Failed to create guest link'
    return
  }

  shareLink.value = getGuestTokenUrl(token.token)
  await copyToClipboard(shareLink.value)

  if (data.canView && data.mediaIds && data.mediaIds.length > 0) {
    showToastMessage(`Guest link created (${data.mediaIds.length} items)`)
  } else {
    showToastMessage('Guest link created and copied to clipboard')
  }

  if (selectionMode.value && data.mediaIds && data.mediaIds.length > 0) {
    toggleSelectionMode()
  }

  showShareModal.value = true
  closeCreateLinkModal()
  await refreshTokens()
}

function closeCreateLinkModal() {
  showCreateLinkModal.value = false
  createLinkError.value = null
}

useHead({
  title: computed(() => event.value ? `${event.value.name} - Media Gallery` : 'Event Dashboard - Media Gallery')
})
</script>
