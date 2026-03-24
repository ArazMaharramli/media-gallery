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

    <!-- Permission-based Tabs -->
    <div v-if="permissions?.canView && permissions?.canUpload" class="flex justify-center">
      <div class="inline-flex rounded-lg bg-gray-100 p-1">
        <button
          @click="activeTab = 'gallery'"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            activeTab === 'gallery'
              ? 'bg-white shadow-sm text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          View Gallery
        </button>
        <button
          @click="activeTab = 'upload'"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            activeTab === 'upload'
              ? 'bg-white shadow-sm text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          <svg class="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload
        </button>
      </div>
    </div>

    <!-- Gallery View (when canView and showing gallery tab) -->
    <template v-if="permissions?.canView && (activeTab === 'gallery' || !permissions?.canUpload)">
      <!-- Toolbar -->
      <div class="flex items-center justify-between bg-white rounded-lg shadow-sm border px-4 py-3">
        <div class="text-sm text-gray-600">
          <span class="font-medium">{{ media.length }}</span> items
        </div>
        <div class="flex items-center gap-2">
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
          <img
            v-if="item.type === 'photo'"
            :src="getMediaUrl(item)"
            :alt="item.originalName"
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div v-else class="absolute inset-0 flex items-center justify-center bg-gray-900">
            <svg class="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div
            v-if="item.type === 'video'"
            class="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Video
          </div>
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span class="p-2 bg-white rounded-full shadow-lg">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </span>
          </div>
          <button
            v-if="permissions?.canDelete"
            @click.stop="deleteMedia(item.id)"
            :disabled="deletingMediaId === item.id"
            class="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50"
            title="Delete"
          >
            <svg v-if="deletingMediaId !== item.id" class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <svg v-else class="w-4 h-4 text-red-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
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
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ item.originalName }}</p>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span class="inline-flex items-center gap-1">
                {{ item.type === 'video' ? 'Video' : 'Photo' }}
              </span>
              <span>{{ formatFileSize(item.size) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
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
            <button
              v-if="permissions?.canDelete"
              @click.stop="deleteMedia(item.id)"
              :disabled="deletingMediaId === item.id"
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete"
            >
              <svg v-if="deletingMediaId !== item.id" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Upload View (when canUpload and showing upload tab) -->
    <template v-if="permissions?.canUpload && (activeTab === 'upload' || !permissions?.canView)">
      <div class="max-w-2xl mx-auto">
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <p class="text-blue-800 text-center">
            Share your photos and videos from the event! Drag files here or click to browse.
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="mt-4 text-gray-600">
              <span class="font-medium text-indigo-600">Click to upload</span> or drag and drop
            </p>
            <p class="mt-2 text-sm text-gray-500">
              JPG, PNG, GIF, WEBP, MP4, MOV, WEBM up to 500MB
            </p>
          </div>
        </div>

        <!-- QR Code Section -->
        <div class="mt-6 bg-white rounded-lg shadow-sm border p-6 text-center">
          <ClientOnly>
            <div class="inline-block p-4 bg-white border rounded-xl shadow-sm">
              <QRCodeVue :value="guestUrl" :size="160" level="M" />
            </div>
            <template #fallback>
              <div class="w-[160px] h-[160px] mx-auto bg-gray-100 rounded flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </template>
          </ClientOnly>
          <p class="mt-4 text-gray-600 text-sm">Scan to open on mobile</p>
          <div class="mt-3 flex items-center justify-center gap-2">
            <input
              type="text"
              readonly
              :value="guestUrl"
              class="flex-1 max-w-xs px-3 py-2 text-sm border rounded-lg bg-gray-50 text-gray-600 truncate"
            />
            <button
              @click="copyLink"
              class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Photo Lightbox -->
    <div
      v-if="lightboxOpen && currentMedia?.type === 'photo'"
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
        :href="getMediaUrl(currentMedia)"
        :download="currentMedia.originalName"
        class="absolute top-4 right-16 p-2 text-white hover:text-gray-300 z-10"
        title="Download"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>
      <button
        v-if="permissions?.canDelete"
        @click="deleteMedia(currentMedia.id)"
        :disabled="deletingMediaId === currentMedia.id"
        class="absolute top-4 right-28 p-2 text-white hover:text-red-400 z-10 disabled:opacity-50"
        title="Delete"
      >
        <svg v-if="deletingMediaId !== currentMedia.id" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <svg v-else class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
      <button
        v-if="hasPrevMedia"
        @click="prevMedia"
        class="absolute left-4 p-2 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-if="hasNextMedia"
        @click="nextMedia"
        class="absolute right-4 p-2 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <img
        :src="getMediaUrl(currentMedia)"
        :alt="currentMedia.originalName"
        class="max-h-[90vh] max-w-[90vw] object-contain"
      />
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
      <button
        @click="closeLightbox"
        class="absolute top-4 right-4 p-2 text-white hover:text-gray-300 z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
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
      <button
        v-if="permissions?.canDelete"
        @click="deleteMedia(currentMedia.id)"
        :disabled="deletingMediaId === currentMedia.id"
        class="absolute top-4 right-28 p-2 text-white hover:text-red-400 z-10 disabled:opacity-50"
        title="Delete"
      >
        <svg v-if="deletingMediaId !== currentMedia.id" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <svg v-else class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
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
import QRCodeVue from 'qrcode.vue'

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
const mediaList = ref<Media[]>([])

// Lightbox state
const lightboxOpen = ref(false)
const currentMediaIndex = ref(0)
const videoPlayerRef = ref<HTMLVideoElement | null>(null)

// Fetch guest data
const { data: response, error, refresh } = await useFetch(`/api/guest/${token}`)

// Handle 404
if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'Access link not found or expired'
  })
}

const event = computed<GuestEvent | null>(() => response.value?.data?.event || null)
const permissions = computed<Permissions | null>(() => response.value?.data?.permissions || null)
const tokenName = computed(() => response.value?.data?.tokenName || null)
const media = computed<Media[]>(() => mediaList.value.length > 0 ? mediaList.value : (response.value?.data?.media || []))

// Sync media list when response changes
watch(() => response.value?.data?.media, (newMedia) => {
  if (newMedia) {
    mediaList.value = [...newMedia]
  }
}, { immediate: true })

// Set initial tab based on permissions
watchEffect(() => {
  if (permissions.value) {
    if (permissions.value.canView && !permissions.value.canUpload) {
      activeTab.value = 'gallery'
    } else if (permissions.value.canUpload && !permissions.value.canView) {
      activeTab.value = 'upload'
    }
  }
})

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

const guestUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/guest/${token}`
  }
  return `/guest/${token}`
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

async function copyLink() {
  try {
    await navigator.clipboard.writeText(guestUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

async function deleteMedia(mediaId: string) {
  if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) {
    return
  }

  deletingMediaId.value = mediaId
  try {
    await $fetch(`/api/guest/${token}/media/${mediaId}`, {
      method: 'DELETE'
    })
    // Remove from local list
    mediaList.value = mediaList.value.filter(m => m.id !== mediaId)
    // Close lightbox if we deleted the current item
    if (lightboxOpen.value && currentMedia.value?.id === mediaId) {
      closeLightbox()
    }
  } catch (err: any) {
    alert(err.data?.error?.message || 'Failed to delete media')
  } finally {
    deletingMediaId.value = null
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
  title: computed(() => event.value ? `${event.value.name} - Guest Access` : 'Guest Access')
})
</script>
