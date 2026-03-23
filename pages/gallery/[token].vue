<template>
  <div class="space-y-6">
    <!-- Gallery Header -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900">John & Jane Wedding</h1>
      <p class="text-gray-500 mt-1">June 15, 2024</p>
      <p class="text-gray-600 mt-2 max-w-2xl mx-auto">
        A beautiful summer wedding celebration. Browse and download photos and videos from the event.
      </p>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center justify-between bg-white rounded-lg shadow-sm border px-4 py-3">
      <div class="text-sm text-gray-600">
        <span class="font-medium">20</span> items
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

    <!-- Grid View -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="item in mediaItems"
        :key="item.id"
        class="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all"
      >
        <div class="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg v-if="item.type === 'video'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <!-- Video indicator -->
        <div v-if="item.type === 'video'" class="absolute top-2 right-2 bg-black bg-opacity-60 rounded px-1.5 py-0.5">
          <span class="text-white text-xs">{{ item.duration }}</span>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-if="viewMode === 'list'" class="bg-white rounded-lg shadow-sm border divide-y">
      <div
        v-for="item in mediaItems"
        :key="item.id"
        class="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <!-- Thumbnail -->
        <div class="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400">
          <svg v-if="item.type === 'video'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
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
            <span>{{ item.size }}</span>
            <span v-if="item.type === 'video'">{{ item.duration }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div class="text-center">
      <button class="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
        Load More
      </button>
    </div>

    <!-- Lightbox (placeholder - would be a modal) -->
    <div class="hidden fixed inset-0 bg-black bg-opacity-90 z-50 items-center justify-center">
      <button class="absolute top-4 right-4 text-white hover:text-gray-300">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div class="max-w-5xl max-h-[80vh] flex items-center justify-center">
        <div class="bg-gray-800 w-96 h-64 rounded-lg flex items-center justify-center text-gray-400">
          Image Preview
        </div>
      </div>
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2">
        <button class="px-4 py-2 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const token = route.params.token

const viewMode = ref<'grid' | 'list'>('grid')

// Sample media items for layout preview
const mediaItems = ref([
  { id: 1, name: 'IMG_001.jpg', type: 'photo', size: '2.4 MB' },
  { id: 2, name: 'IMG_002.jpg', type: 'photo', size: '3.1 MB' },
  { id: 3, name: 'IMG_003.jpg', type: 'photo', size: '1.8 MB' },
  { id: 4, name: 'VID_001.mp4', type: 'video', size: '45 MB', duration: '0:45' },
  { id: 5, name: 'IMG_004.jpg', type: 'photo', size: '2.2 MB' },
  { id: 6, name: 'IMG_005.jpg', type: 'photo', size: '2.9 MB' },
  { id: 7, name: 'IMG_006.jpg', type: 'photo', size: '1.5 MB' },
  { id: 8, name: 'VID_002.mp4', type: 'video', size: '120 MB', duration: '2:30' },
  { id: 9, name: 'IMG_007.jpg', type: 'photo', size: '3.3 MB' },
  { id: 10, name: 'IMG_008.jpg', type: 'photo', size: '2.1 MB' },
  { id: 11, name: 'IMG_009.jpg', type: 'photo', size: '2.7 MB' },
  { id: 12, name: 'VID_003.mp4', type: 'video', size: '85 MB', duration: '1:15' },
  { id: 13, name: 'IMG_010.jpg', type: 'photo', size: '1.9 MB' },
  { id: 14, name: 'IMG_011.jpg', type: 'photo', size: '2.5 MB' },
  { id: 15, name: 'IMG_012.jpg', type: 'photo', size: '3.0 MB' },
  { id: 16, name: 'VID_004.mp4', type: 'video', size: '200 MB', duration: '3:45' },
  { id: 17, name: 'IMG_013.jpg', type: 'photo', size: '2.3 MB' },
  { id: 18, name: 'IMG_014.jpg', type: 'photo', size: '1.7 MB' },
  { id: 19, name: 'IMG_015.jpg', type: 'photo', size: '2.8 MB' },
  { id: 20, name: 'VID_005.mp4', type: 'video', size: '150 MB', duration: '2:00' },
])

useHead({
  title: 'Gallery - Media Gallery'
})
</script>
