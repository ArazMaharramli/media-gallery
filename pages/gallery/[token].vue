<template>
  <div class="space-y-6">
    <!-- Gallery Header -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900">{{ event?.name }}</h1>
      <p class="text-gray-500 mt-1">{{ formattedDate }}</p>
      <p v-if="event?.description" class="text-gray-600 mt-2 max-w-2xl mx-auto">
        {{ event.description }}
      </p>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center justify-between bg-white rounded-lg shadow-sm border px-4 py-3">
      <div class="text-sm text-gray-600">
        <span class="font-medium">{{ media.length }}</span> items
      </div>
      <div class="flex items-center gap-2">
        <!-- View Toggle -->
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
    <div v-if="media.length === 0" class="text-center py-12 bg-white rounded-lg shadow-sm border">
      <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="mt-2 text-sm text-gray-500">No media in this gallery yet</p>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="(item, index) in media"
        :key="item.id"
        @click="openLightbox(index)"
        class="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all"
      >
        <!-- Photo Thumbnail -->
        <img
          v-if="item.type === 'photo'"
          :src="getMediaUrl(item)"
          :alt="item.originalName"
          class="absolute inset-0 w-full h-full object-cover"
        />
        <!-- Video Thumbnail -->
        <div v-else class="absolute inset-0 flex items-center justify-center bg-gray-900">
          <svg class="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Video Badge -->
        <div
          v-if="item.type === 'video'"
          class="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Video
        </div>

        <!-- Hover Overlay -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span class="p-2 bg-white rounded-full shadow-lg">
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="bg-white rounded-lg shadow-sm border divide-y">
      <div
        v-for="(item, index) in media"
        :key="item.id"
        @click="openLightbox(index)"
        class="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <!-- Thumbnail -->
        <div class="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
          <img
            v-if="item.type === 'photo'"
            :src="getMediaUrl(item)"
            :alt="item.originalName"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-900 text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ item.originalName }}</p>
          <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span class="inline-flex items-center gap-1">
              <svg v-if="item.type === 'video'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ item.type === 'video' ? 'Video' : 'Photo' }}
            </span>
            <span>{{ formatFileSize(item.size) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            @click.stop="openLightbox(index)"
            class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <a
            :href="getMediaUrl(item)"
            :download="item.originalName"
            @click.stop
            class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Download"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- Photo Lightbox -->
    <div
      v-if="lightboxOpen && currentMedia?.type === 'photo'"
      class="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      @click.self="closeLightbox"
    >
      <!-- Close Button -->
      <button
        @click="closeLightbox"
        class="absolute top-4 right-4 p-2 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Download Button -->
      <a
        :href="getMediaUrl(currentMedia)"
        :download="currentMedia.originalName"
        class="absolute top-4 right-16 p-2 text-white hover:text-gray-300 z-10"
        title="Download"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>

      <!-- Previous Button -->
      <button
        v-if="hasPrevMedia"
        @click="prevMedia"
        class="absolute left-4 p-2 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Next Button -->
      <button
        v-if="hasNextMedia"
        @click="nextMedia"
        class="absolute right-4 p-2 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Image -->
      <img
        :src="getMediaUrl(currentMedia)"
        :alt="currentMedia.originalName"
        class="max-h-[90vh] max-w-[90vw] object-contain"
      />

      <!-- Counter -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {{ currentMediaIndex + 1 }} / {{ media.length }}
      </div>
    </div>

    <!-- Video Player Modal -->
    <div
      v-if="lightboxOpen && currentMedia?.type === 'video'"
      class="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      @click.self="closeLightbox"
    >
      <!-- Close Button -->
      <button
        @click="closeLightbox"
        class="absolute top-4 right-4 p-2 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Download Button -->
      <a
        :href="getMediaUrl(currentMedia)"
        :download="currentMedia.originalName"
        class="absolute top-4 right-16 p-2 text-white hover:text-gray-300 z-10"
        title="Download"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>

      <!-- Video Player -->
      <video
        ref="videoPlayerRef"
        :src="getMediaUrl(currentMedia)"
        controls
        autoplay
        class="max-h-[90vh] max-w-[90vw]"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Media {
  id: string
  eventId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  type: 'photo' | 'video'
  createdAt: string
}

interface GalleryEvent {
  id: string
  name: string
  description: string | null
  date: string
}

const route = useRoute()
const token = route.params.token as string

const viewMode = ref<'grid' | 'list'>('grid')

// Lightbox state
const lightboxOpen = ref(false)
const currentMediaIndex = ref(0)
const videoPlayerRef = ref<HTMLVideoElement | null>(null)

// Fetch gallery data
const { data: response, error } = await useFetch(`/api/gallery/${token}`)

// Handle 404
if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'Gallery not found'
  })
}

const event = computed<GalleryEvent | null>(() => response.value?.data?.event || null)
const media = computed<Media[]>(() => response.value?.data?.media || [])

// Lightbox computed
const currentMedia = computed(() => media.value[currentMediaIndex.value])
const hasPrevMedia = computed(() => currentMediaIndex.value > 0)
const hasNextMedia = computed(() => currentMediaIndex.value < media.value.length - 1)

// Format date
const formattedDate = computed(() => {
  if (!event.value?.date) return ''
  return new Date(event.value.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getMediaUrl(item: Media): string {
  return `/api/uploads/${item.eventId}/${item.filename}`
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
  if (hasPrevMedia.value) {
    currentMediaIndex.value--
  }
}

function nextMedia() {
  if (hasNextMedia.value) {
    currentMediaIndex.value++
  }
}

// Keyboard navigation
function handleKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return

  switch (e.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowLeft':
      prevMedia()
      break
    case 'ArrowRight':
      nextMedia()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

useHead({
  title: computed(() => event.value ? `${event.value.name} - Gallery` : 'Gallery')
})
</script>
