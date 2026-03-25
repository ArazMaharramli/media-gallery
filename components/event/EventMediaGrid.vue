<template>
  <div class="p-6">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <span v-if="selectionMode && selectedCount > 0" class="text-sm text-indigo-600">
          {{ selectedCount }} selected
        </span>
      </div>
      <div class="flex items-center gap-2">
        <template v-if="selectionMode">
          <button
            @click="$emit('selectAll')"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Select All
          </button>
          <button
            @click="$emit('deselectAll')"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Deselect All
          </button>
          <button
            v-if="selectedCount > 0"
            @click="$emit('deleteSelected')"
            class="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
          >
            Delete
          </button>
          <button
            @click="$emit('exitSelectionMode')"
            class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Done
          </button>
        </template>
        <template v-else>
          <button
            v-if="media.length > 0"
            @click="$emit('enterSelectionMode')"
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Select
          </button>
          <!-- View Mode Toggle -->
          <div v-if="media.length > 0" class="flex items-center border border-gray-200 rounded-md overflow-hidden mr-2">
            <button
              @click="$emit('update:viewMode', 'grid')"
              class="p-1.5 transition-colors"
              :class="viewMode === 'grid' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-500 hover:text-gray-700'"
              title="Grid view"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              @click="$emit('update:viewMode', 'list')"
              class="p-1.5 transition-colors"
              :class="viewMode === 'list' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-500 hover:text-gray-700'"
              title="List view"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <MediaCard
        v-for="(item, index) in media"
        :key="item.id"
        :media="item"
        :is-selected="isSelected(item.id)"
        :selection-mode="selectionMode"
        :uploader-name="getUploaderName(item.guestTokenId)"
        @click="$emit('openLightbox', index)"
        @select="$emit('toggleSelection', item.id)"
        @preview="$emit('openLightbox', index)"
        @delete="$emit('confirmDelete', item)"
      />
    </div>

    <!-- List View -->
    <div v-else class="space-y-2">
      <div
        v-for="(item, index) in media"
        :key="item.id"
        @click="handleCardClick(item.id, index)"
        class="group flex items-center gap-4 p-3 bg-gray-50 rounded-lg cursor-pointer transition-colors"
        :class="selectionMode && isSelected(item.id) ? 'bg-indigo-50 ring-2 ring-indigo-500' : 'hover:bg-gray-100'"
      >
        <!-- Selection Checkbox -->
        <div v-if="selectionMode" class="flex-shrink-0">
          <div
            class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-sm"
            :class="isSelected(item.id) ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-white border-gray-400'"
          >
            <svg v-if="isSelected(item.id)" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <!-- Thumbnail -->
        <div class="relative w-16 h-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
          <img
            v-if="!showThumbnailPlaceholder(item)"
            :src="getThumbnailUrl(item)"
            :alt="item.originalName"
            class="w-full h-full object-cover"
          />
          <!-- Placeholder for videos without thumbnail -->
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
          >
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div
            v-if="item.type === 'video'"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div class="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
              <svg class="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Media Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ item.originalName }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs text-gray-500 capitalize">{{ item.type }}</span>
            <span
              v-if="item.uploadedBy === 'guest' && getUploaderName(item.guestTokenId)"
              class="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded"
            >
              {{ getUploaderName(item.guestTokenId) }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex-shrink-0 flex items-center gap-2">
          <button
            @click.stop="$emit('openLightbox', index)"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            title="Preview"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            v-if="!selectionMode"
            @click.stop="$emit('confirmDelete', item)"
            class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
      <div v-else-if="!hasMore && media.length > 0" class="text-sm text-gray-400">
        {{ totalCount }} items total
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaOutput, GuestTokenOutput } from '~/shared/schemas'

interface Props {
  media: MediaOutput[]
  guestTokens: Pick<GuestTokenOutput, 'id' | 'name'>[]
  viewMode: 'grid' | 'list'
  selectionMode: boolean
  selectedIds: Set<string>
  isLoadingMore: boolean
  hasMore: boolean
  totalCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:viewMode': [mode: 'grid' | 'list']
  enterSelectionMode: []
  exitSelectionMode: []
  selectAll: []
  deselectAll: []
  toggleSelection: [id: string]
  openLightbox: [index: number]
  confirmDelete: [media: MediaOutput]
  deleteSelected: []
  loadMore: []
}>()

const loadMoreTrigger = ref<HTMLElement | null>(null)

const selectedCount = computed(() => props.selectedIds.size)

function isSelected(id: string): boolean {
  return props.selectedIds.has(id)
}

function getUploaderName(tokenId: string | null): string | null {
  if (!tokenId) return null
  const token = props.guestTokens.find(t => t.id === tokenId)
  return token?.name || null
}

function getThumbnailUrl(item: MediaOutput): string {
  return item.thumbnail || item.thumbnailFallback || (item.type === 'photo' ? item.filename : '')
}

function showThumbnailPlaceholder(item: MediaOutput): boolean {
  // Videos without thumbnails need a placeholder (thumbnails are generated async)
  return item.type === 'video' && !item.thumbnail
}

function handleCardClick(id: string, index: number) {
  if (props.selectionMode) {
    emit('toggleSelection', id)
  } else {
    emit('openLightbox', index)
  }
}

// Intersection observer for infinite scroll
let observer: IntersectionObserver | null = null

function setupIntersectionObserver() {
  if (!loadMoreTrigger.value) return

  // Disconnect existing observer to prevent memory leaks
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && props.hasMore && !props.isLoadingMore) {
        emit('loadMore')
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
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

watch(loadMoreTrigger, () => {
  setupIntersectionObserver()
})
</script>
