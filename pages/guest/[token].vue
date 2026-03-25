<template>
  <div class="space-y-6">
    <!-- Guest Header -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900">{{ event?.name }}</h1>
      <p class="text-gray-500 mt-1">{{ formattedDate }}</p>
      <p v-if="event?.description" class="text-gray-600 mt-2 max-w-2xl mx-auto">
        {{ event.description }}
      </p>
      <p v-if="tokenName" class="text-indigo-600 mt-2 text-sm">
        Welcome, {{ tokenName }}!
      </p>
    </div>

    <!-- Main Content Card with Tabs -->
    <div class="bg-white rounded-lg shadow-sm border">
      <!-- Tab Bar -->
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button
            v-if="canShowGallery"
            @click="activeTab = 'gallery'"
            class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === 'gallery' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Gallery
              <span class="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {{ displayedMedia.length }}
              </span>
            </span>
          </button>
          <button
            v-if="permissions?.canUpload"
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
              <span v-else-if="resumableUploads && resumableUploads.length > 0" class="w-2 h-2 bg-amber-500 rounded-full" title="Incomplete uploads"></span>
            </span>
          </button>
        </nav>
      </div>

      <!-- Gallery Tab Content -->
      <div v-if="canShowGallery && activeTab === 'gallery'" class="p-6">
        <!-- Toolbar -->
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ totalMediaCount > 0 ? totalMediaCount : displayedMedia.length }}</span> items
          </div>
          <div class="flex items-center gap-4">
            <!-- Uploaded by me toggle -->
            <label v-if="permissions?.canUpload" class="flex items-center gap-2 cursor-pointer">
              <span class="text-sm text-gray-600">Uploaded by me</span>
              <button
                type="button"
                role="switch"
                :aria-checked="showOnlyMine"
                @click="showOnlyMine = !showOnlyMine"
                :class="[
                  'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                  showOnlyMine ? 'bg-indigo-600' : 'bg-gray-200'
                ]"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    showOnlyMine ? 'translate-x-4' : 'translate-x-0'
                  ]"
                />
              </button>
            </label>
            <!-- View mode toggle -->
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
                title="Grid view"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                ]"
                title="List view"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="displayedMedia.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="mt-2 text-sm text-gray-500">{{ showOnlyMine ? 'You haven\'t uploaded any media yet' : 'No media in this gallery yet' }}</p>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MediaCard
            v-for="(item, index) in displayedMedia"
            :key="item.id"
            :media="item"
            :show-delete="canDeleteItem(item)"
            @click="openLightbox(index)"
            @delete="confirmDeleteMedia(item)"
          />
        </div>

        <!-- List View -->
        <div v-else class="divide-y border rounded-lg overflow-hidden">
          <div
            v-for="(item, index) in displayedMedia"
            :key="item.id"
            @click="openLightbox(index)"
            class="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
              <img
                v-if="item.thumbnail"
                :src="item.thumbnail || item.thumbnailFallback || item.filename"
                :alt="item.originalName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg v-if="item.type === 'video'" class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ item.originalName }}</p>
              <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{{ item.type === 'video' ? 'Video' : 'Photo' }}</span>
                <span>{{ formatFileSize(item.size) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a
                :href="item.filename"
                :download="item.originalName"
                @click.stop
                class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Download"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
              <button
                v-if="canDeleteItem(item)"
                @click.stop="confirmDeleteMedia(item)"
                :disabled="deletingMediaId === item.id"
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Delete"
              >
                <svg v-if="deletingMediaId !== item.id" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Trigger / Loading Indicator -->
        <div ref="loadMoreTrigger" class="py-8 flex justify-center">
          <div v-if="isLoadingMore" class="flex items-center gap-2 text-gray-500">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm">Loading more...</span>
          </div>
          <div v-else-if="!hasMoreMedia && displayedMedia.length > 0" class="text-sm text-gray-400">
            {{ totalMediaCount }} items total
          </div>
        </div>
      </div>

      <!-- Upload Tab Content -->
      <div v-if="permissions?.canUpload && activeTab === 'upload'" class="p-6">
        <div class="flex flex-col md:flex-row md:items-stretch gap-6">
          <div class="flex-1 min-h-[240px]">
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

          <!-- Divider - hidden on mobile -->
          <div class="hidden md:block w-px bg-gray-200 self-stretch"></div>

          <!-- QR Code Section - hidden on mobile -->
          <div class="hidden md:flex md:flex-col md:items-center md:justify-center md:w-56 min-h-[240px]">
            <ClientOnly>
              <div class="p-4 bg-white border rounded-xl shadow-sm">
                <QRCodeVue :value="guestUrl" :size="140" level="M" />
              </div>
              <template #fallback>
                <div class="w-[140px] h-[140px] bg-gray-100 rounded flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </template>
            </ClientOnly>
            <p class="mt-3 text-gray-600 text-sm text-center">Scan to upload from mobile</p>
            <button
              @click="copyLink"
              class="mt-3 w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ copied ? 'Copied!' : 'Copy Link' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox (replaces 116 lines of inline photo+video modals) -->
    <MediaLightbox
      :is-open="lightboxOpen"
      :current-media="currentMedia"
      :current-index="currentMediaIndex"
      :total-count="displayedMedia.length"
      :has-prev="hasPrevMedia"
      :has-next="hasNextMedia"
      @close="closeLightbox"
      @prev="prevMedia"
      @next="nextMedia"
    />

    <!-- Delete Confirmation Modal (replaces window.confirm) -->
    <CommonConfirmModal
      :is-open="showDeleteModal"
      title="Delete Media"
      :message="`Are you sure you want to delete ${mediaToDelete?.originalName}? This action cannot be undone.`"
      confirm-text="Delete"
      :is-loading="deletingMediaId !== null"
      variant="danger"
      @confirm="executeDelete"
      @cancel="showDeleteModal = false; mediaToDelete = null"
    />

    <!-- Toast Notification (replaces alert()) -->
    <CommonToast
      :show="showToast"
      :message="toastMessage"
      @hide="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
import type { MediaOutput } from '~/shared/schemas'
import { formatFileSize } from '~/utils/formatters'
import QRCodeVue from 'qrcode.vue'

interface GuestEvent {
  id: string
  name: string
  description: string | null
  date: string
}

interface Permissions {
  canView: boolean
  canUpload: boolean
  canDelete: boolean
}

const route = useRoute()
const token = route.params.token as string

// State
const viewMode = ref<'grid' | 'list'>('grid')
const activeTab = ref<'gallery' | 'upload'>('gallery')
const copied = ref(false)
const deletingMediaId = ref<string | null>(null)
const mediaList = ref<MediaOutput[]>([])
const showOnlyMine = ref(false)

// Delete modal state
const showDeleteModal = ref(false)
const mediaToDelete = ref<MediaOutput | null>(null)

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
let toastTimeout: ReturnType<typeof setTimeout> | null = null

// Pagination state
const currentPage = ref(1)
const totalMediaCount = ref(0)
const hasMoreMedia = ref(true)
const isLoadingMore = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)

// Upload composable
const {
  uploadQueue, addFiles: addFilesToQueue, cancelUpload,
  pauseUpload, resumeUpload, retryUpload, removeFromQueue, clearCompleted,
  resumableUploads, dismissResumableUpload, clearResumableUploads
} = useMediaUpload(`/api/guest/${token}/upload`, onUploadComplete, {
  metadata: { guestToken: token }
})

// Active uploads count for tab indicator
const activeUploadsCount = computed(() =>
  uploadQueue.value.filter(item =>
    item.status === 'uploading' || item.status === 'pending' || item.status === 'paused'
  ).length
)

// Fetch guest data
const { data: response, error } = await useFetch(`/api/guest/${token}`)

if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'Access link not found or expired'
  })
}

const event = computed<GuestEvent | null>(() => response.value?.data?.event || null)
const permissions = computed<Permissions | null>(() => response.value?.data?.permissions || null)
const tokenName = computed(() => response.value?.data?.tokenName || null)
const tokenId = computed(() => response.value?.data?.tokenId || null)

// Media list from server (already filtered and paginated)
const displayedMedia = computed<MediaOutput[]>(() => mediaList.value)

const canShowGallery = computed(() =>
  permissions.value?.canView || permissions.value?.canUpload
)

// Lightbox composable
const {
  isOpen: lightboxOpen, currentIndex: currentMediaIndex,
  currentItem: currentMedia, hasPrev: hasPrevMedia, hasNext: hasNextMedia,
  open: openLightbox, close: closeLightbox,
  prev: prevMedia, next: nextMedia
} = useLightbox(displayedMedia)

// Sync state when response changes
watch(() => response.value?.data, (data) => {
  if (!data) return
  if (data.media) mediaList.value = [...data.media]
  if (data.pagination) {
    totalMediaCount.value = data.pagination.total
    hasMoreMedia.value = data.pagination.hasMore
    currentPage.value = data.pagination.page
  }
}, { immediate: true })

// Set initial tab based on permissions
watchEffect(() => {
  if (permissions.value) {
    if (canShowGallery.value && !permissions.value.canUpload) {
      activeTab.value = 'gallery'
    } else if (permissions.value.canUpload && !canShowGallery.value) {
      activeTab.value = 'upload'
    }
  }
})

// Format date
const formattedDate = computed(() => {
  if (!event.value?.date) return ''
  return new Date(event.value.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const guestUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/guest/${token}`
  }
  return `/guest/${token}`
})

// Permission check
function canDeleteItem(item: MediaOutput): boolean {
  if (item.guestTokenId && item.guestTokenId === tokenId.value) return true
  return permissions.value?.canDelete === true
}

// Fetch media with current filter
async function fetchMedia(page: number = 1, append: boolean = false) {
  const params: Record<string, any> = { page, limit: 20 }
  if (showOnlyMine.value) params.filter = 'mine'

  try {
    const res = await $fetch(`/api/guest/${token}`, { params }) as any
    const { media, pagination } = res?.data || {}

    if (media) {
      mediaList.value = append ? [...mediaList.value, ...media] : media
    }
    if (pagination) {
      totalMediaCount.value = pagination.total
      hasMoreMedia.value = pagination.hasMore
      currentPage.value = pagination.page
    }
  } catch {
    // Silently fail
  }
}

// Watch filter changes
watch(showOnlyMine, () => fetchMedia(1))

// Upload complete handler
function onUploadComplete() {
  fetchMedia(1)
}

// Load more media for infinite scroll
async function loadMoreMedia() {
  if (isLoadingMore.value || !hasMoreMedia.value) return
  isLoadingMore.value = true
  await fetchMedia(currentPage.value + 1, true)
  isLoadingMore.value = false
}

// Delete flow with modal
function confirmDeleteMedia(item: MediaOutput) {
  mediaToDelete.value = item
  showDeleteModal.value = true
}

async function executeDelete() {
  if (!mediaToDelete.value) return
  const mediaId = mediaToDelete.value.id

  deletingMediaId.value = mediaId
  try {
    await $fetch(`/api/guest/${token}/media/${mediaId}`, { method: 'DELETE' })
    mediaList.value = mediaList.value.filter(m => m.id !== mediaId)
    totalMediaCount.value = Math.max(0, totalMediaCount.value - 1)
    if (lightboxOpen.value && currentMedia.value?.id === mediaId) {
      closeLightbox()
    }
  } catch (err: any) {
    showToastMessage(err.data?.error?.message || 'Failed to delete media')
  } finally {
    deletingMediaId.value = null
    showDeleteModal.value = false
    mediaToDelete.value = null
  }
}

// Toast helper
function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  if (toastTimeout) {
    clearTimeout(toastTimeout)
  }
  toastTimeout = setTimeout(() => { showToast.value = false }, 3000)
}

// Copy link
async function copyLink() {
  try {
    await navigator.clipboard.writeText(guestUrl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Clipboard API not available
  }
}

// Intersection observer for infinite scroll
let observer: IntersectionObserver | null = null

function setupIntersectionObserver() {
  if (!loadMoreTrigger.value) return
  if (observer) observer.disconnect()

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMoreMedia.value && !isLoadingMore.value) {
        loadMoreMedia()
      }
    },
    { rootMargin: '100px' }
  )

  observer.observe(loadMoreTrigger.value)
}

onMounted(() => {
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  if (toastTimeout) clearTimeout(toastTimeout)
})

watch(loadMoreTrigger, () => {
  setupIntersectionObserver()
})

useHead({
  title: computed(() => event.value ? `${event.value.name} - Guest Access` : 'Guest Access')
})
</script>
