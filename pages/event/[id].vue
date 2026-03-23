<template>
  <div class="space-y-6">
    <!-- Event Header -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ event?.name }}</h1>
          <p class="text-gray-500 mt-1">{{ formattedDate }}</p>
          <p v-if="event?.description" class="text-gray-600 mt-2">{{ event.description }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            @click="handleShareGallery"
            :disabled="isCreatingViewToken"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <svg v-if="isCreatingViewToken" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Gallery
          </button>
          <button
            @click="showUploadLinks = !showUploadLinks"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Upload Links
            <span v-if="uploadTokens.length > 0" class="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
              {{ uploadTokens.filter(t => t.active).length }}
            </span>
            <svg
              class="w-4 h-4 ml-2 transition-transform"
              :class="{ 'rotate-180': showUploadLinks }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Upload Links Panel (collapsible) -->
      <div v-if="showUploadLinks" class="mt-6 pt-6 border-t">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-900">Upload Links</h3>
          <button
            @click="showNewLinkModal = true"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Link
          </button>
        </div>
        <div v-if="uploadTokens.length === 0" class="text-center py-4 text-gray-500 text-sm">
          No upload links yet. Create one to let guests upload media.
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="token in uploadTokens"
            :key="token.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            :class="{ 'opacity-60': !token.active }"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-2 h-2 rounded-full flex-shrink-0"
                :class="token.active ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
              <div>
                <p class="text-sm font-semibold" :class="token.active ? 'text-gray-900' : 'text-gray-500'">
                  {{ token.name }}
                </p>
                <p class="text-xs font-mono" :class="token.active ? 'text-gray-500' : 'text-gray-400'">
                  {{ token.token }} · {{ formatTokenDate(token.createdAt) }}
                  <span v-if="!token.active"> · Deactivated</span>
                </p>
              </div>
            </div>
            <div v-if="token.active" class="flex items-center gap-2">
              <button
                @click="copyUploadLink(token.token)"
                class="p-1.5 text-gray-400 hover:text-gray-600"
                title="Copy link"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
              <button
                @click="deactivateToken(token.id)"
                :disabled="deactivatingTokenId === token.id"
                class="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
              >
                {{ deactivatingTokenId === token.id ? 'Deactivating...' : 'Deactivate' }}
              </button>
            </div>
            <span v-else class="text-xs text-gray-400 px-2 py-1">Inactive</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">Share upload links with guests so they can contribute photos and videos. The name helps identify who uploaded the media.</p>
      </div>
    </div>

    <!-- Share Link Modal -->
    <div v-if="showShareModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-30" @click="showShareModal = false"></div>
        <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Share Gallery</h3>
            <button @click="showShareModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-4">
            <p class="text-sm text-gray-600">Share this link with your clients to view the gallery:</p>
            <div class="flex items-center gap-2">
              <input
                type="text"
                readonly
                :value="shareLink"
                class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
              />
              <button
                @click="copyShareLink"
                class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                {{ copiedShare ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Link Modal -->
    <div v-if="showNewLinkModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-30" @click="closeNewLinkModal"></div>
        <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Create Upload Link</h3>
            <button @click="closeNewLinkModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="createUploadLink" class="space-y-4">
            <div>
              <label for="linkName" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                id="linkName"
                v-model="newLinkName"
                type="text"
                placeholder="e.g., Uncle Bob, Wedding Party"
                maxlength="50"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p class="mt-1 text-xs text-gray-500">This name will identify who uploaded the media.</p>
            </div>

            <div v-if="createLinkError" class="text-sm text-red-600">{{ createLinkError }}</div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeNewLinkModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!newLinkName.trim() || isCreatingLink"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isCreatingLink ? 'Creating...' : 'Create Link' }}
              </button>
            </div>
          </form>
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

      <!-- Delete Button -->
      <button
        @click="confirmDelete(currentMedia)"
        class="absolute top-4 right-28 p-2 text-white hover:text-red-400 z-10"
        title="Delete"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      <!-- Delete Button -->
      <button
        @click="confirmDelete(currentMedia)"
        class="absolute top-4 right-28 p-2 text-white hover:text-red-400 z-10"
        title="Delete"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-30" @click="closeDeleteModal"></div>
        <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Delete Media</h3>
            <button @click="closeDeleteModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              Are you sure you want to delete <span class="font-medium">{{ mediaToDelete?.originalName }}</span>? This action cannot be undone.
            </p>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeDeleteModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                @click="deleteMedia"
                :disabled="isDeleting"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Zone -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Upload Media</h2>

      <!-- Drop Zone -->
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInputRef?.click()"
        class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
        :class="isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'"
      >
        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
          class="hidden"
          @change="handleFileSelect"
        />
        <svg class="mx-auto h-12 w-12" :class="isDragging ? 'text-indigo-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="mt-2 text-sm text-gray-600">
          <span class="font-medium text-indigo-600">Click to upload</span> or drag and drop
        </p>
        <p class="mt-1 text-xs text-gray-500">
          JPG, PNG, GIF, WEBP, MP4, MOV, WEBM up to 500MB
        </p>
      </div>

      <!-- Upload Queue -->
      <div v-if="uploadQueue.length > 0" class="mt-4 space-y-2">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <span>Upload Queue ({{ uploadQueue.length }} files)</span>
          <button
            v-if="uploadQueue.some(f => f.status === 'pending' || f.status === 'error')"
            @click="clearCompleted"
            class="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear completed
          </button>
        </div>

        <div
          v-for="item in uploadQueue"
          :key="item.id"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <!-- File Icon -->
          <div class="flex-shrink-0">
            <svg v-if="item.file.type.startsWith('video')" class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ item.file.name }}</p>
            <p class="text-xs text-gray-500">{{ formatFileSize(item.file.size) }}</p>

            <!-- Progress Bar -->
            <div v-if="item.status === 'uploading'" class="mt-1">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-indigo-600 transition-all duration-300"
                    :style="{ width: `${item.progress}%` }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500 w-10 text-right">{{ item.progress }}%</span>
              </div>
            </div>

            <!-- Error Message -->
            <p v-if="item.status === 'error'" class="text-xs text-red-600 mt-1">
              {{ item.error }}
            </p>
          </div>

          <!-- Status / Actions -->
          <div class="flex-shrink-0">
            <!-- Pending -->
            <span v-if="item.status === 'pending'" class="text-xs text-gray-400">Waiting...</span>

            <!-- Uploading -->
            <button
              v-else-if="item.status === 'uploading'"
              @click="cancelUpload(item.id)"
              class="p-1 text-gray-400 hover:text-red-500"
              title="Cancel"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Completed -->
            <svg v-else-if="item.status === 'completed'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>

            <!-- Error -->
            <div v-else-if="item.status === 'error'" class="flex items-center gap-1">
              <button
                @click="retryUpload(item.id)"
                class="p-1 text-gray-400 hover:text-indigo-500"
                title="Retry"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                @click="removeFromQueue(item.id)"
                class="p-1 text-gray-400 hover:text-red-500"
                title="Remove"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Grid -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Media ({{ media.length }} items)</h2>
      </div>

      <div v-if="media.length === 0" class="text-center py-8 text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="mt-2 text-sm">No media uploaded yet</p>
        <p class="text-xs text-gray-400">Upload photos and videos to get started</p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="(item, index) in media"
          :key="item.id"
          @click="openLightbox(index)"
          class="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
        >
          <!-- Thumbnail -->
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

          <!-- Uploader Badge -->
          <div
            v-if="item.uploadedBy === 'guest' && getUploaderName(item.uploadTokenId)"
            class="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded"
          >
            {{ getUploaderName(item.uploadTokenId) }}
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
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex gap-2">
              <span class="p-2 bg-white rounded-full shadow-lg">
                <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </span>
              <button
                @click="confirmDelete(item, $event)"
                class="p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                title="Delete"
              >
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="showToast"
        class="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface UploadToken {
  id: string
  eventId: string
  token: string
  name: string
  active: boolean
  createdAt: string
}

interface Media {
  id: string
  eventId: string
  uploadTokenId: string | null
  filename: string
  originalName: string
  mimeType: string
  size: number
  storageKey: string
  type: 'photo' | 'video'
  uploadedBy: 'photographer' | 'guest'
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

const route = useRoute()
const eventId = route.params.id as string

// UI state
const showUploadLinks = ref(false)
const showNewLinkModal = ref(false)
const showShareModal = ref(false)
const showDeleteModal = ref(false)
const newLinkName = ref('')
const createLinkError = ref('')
const isCreatingLink = ref(false)
const isCreatingViewToken = ref(false)
const deactivatingTokenId = ref<string | null>(null)
const shareLink = ref('')
const copiedShare = ref(false)
const mediaToDelete = ref<Media | null>(null)
const isDeleting = ref(false)
const toastMessage = ref('')
const showToast = ref(false)

// Upload state
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const uploadQueue = ref<UploadQueueItem[]>([])
const isProcessingQueue = ref(false)

// Lightbox state
const lightboxOpen = ref(false)
const currentMediaIndex = ref(0)
const videoPlayerRef = ref<HTMLVideoElement | null>(null)

// Fetch event data
const { data: eventResponse, error } = await useFetch(`/api/events/${eventId}`)

// Handle 404
if (error.value) {
  throw createError({
    statusCode: 404,
    message: 'Event not found'
  })
}

// Extract event data from response
const event = computed(() => eventResponse.value?.data)

// Fetch upload tokens
const { data: tokensResponse, refresh: refreshTokens } = await useFetch(`/api/events/${eventId}/upload-tokens`)
const uploadTokens = computed<UploadToken[]>(() => tokensResponse.value?.data || [])

// Fetch media
const { data: mediaResponse, refresh: refreshMedia } = await useFetch(`/api/events/${eventId}/media`)
const media = computed<Media[]>(() => mediaResponse.value?.data || [])

// Lightbox computed properties
const currentMedia = computed(() => media.value[currentMediaIndex.value])
const hasPrevMedia = computed(() => currentMediaIndex.value > 0)
const hasNextMedia = computed(() => currentMediaIndex.value < media.value.length - 1)

// Format date for display
const formattedDate = computed(() => {
  if (!event.value?.date) return ''
  return new Date(event.value.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

function formatTokenDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getUploaderName(tokenId: string | null): string | null {
  if (!tokenId) return null
  const token = uploadTokens.value.find(t => t.id === tokenId)
  return token?.name || null
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

// Upload link management
async function createUploadLink() {
  if (!newLinkName.value.trim()) return

  isCreatingLink.value = true
  createLinkError.value = ''

  try {
    await $fetch(`/api/events/${eventId}/upload-tokens`, {
      method: 'POST',
      body: { name: newLinkName.value.trim() }
    })

    await refreshTokens()
    closeNewLinkModal()
  } catch (err: any) {
    createLinkError.value = err.data?.error?.message || 'Failed to create upload link'
  } finally {
    isCreatingLink.value = false
  }
}

function closeNewLinkModal() {
  showNewLinkModal.value = false
  newLinkName.value = ''
  createLinkError.value = ''
}

async function deactivateToken(tokenId: string) {
  deactivatingTokenId.value = tokenId

  try {
    await $fetch(`/api/events/${eventId}/upload-tokens/${tokenId}/deactivate`, {
      method: 'PATCH'
    })

    await refreshTokens()
  } catch (err: any) {
    console.error('Failed to deactivate token:', err)
  } finally {
    deactivatingTokenId.value = null
  }
}

function copyUploadLink(token: string) {
  const link = `${window.location.origin}/upload/${token}`
  navigator.clipboard.writeText(link)
  showToastMessage('Upload link copied to clipboard')
}

function showToastMessage(message: string) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

async function handleShareGallery() {
  isCreatingViewToken.value = true

  try {
    const response = await $fetch(`/api/events/${eventId}/view-tokens`, {
      method: 'POST'
    })

    shareLink.value = `${window.location.origin}/gallery/${response.data.token}`

    // Auto-copy to clipboard
    await navigator.clipboard.writeText(shareLink.value)
    showToastMessage('Share link copied to clipboard')

    showShareModal.value = true
  } catch (err: any) {
    console.error('Failed to create share link:', err)
  } finally {
    isCreatingViewToken.value = false
  }
}

function copyShareLink() {
  navigator.clipboard.writeText(shareLink.value)
  copiedShare.value = true
  showToastMessage('Share link copied to clipboard')
  setTimeout(() => {
    copiedShare.value = false
  }, 2000)
}

// File upload handling
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm'
]
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    addFilesToQueue(Array.from(files))
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    addFilesToQueue(Array.from(input.files))
    input.value = '' // Reset input for re-selection
  }
}

function addFilesToQueue(files: File[]) {
  for (const file of files) {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      continue
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      continue
    }

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

  // Process next item
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

// Delete media functions
function confirmDelete(item: Media, e?: Event) {
  e?.stopPropagation()
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
    await $fetch(`/api/media/${mediaToDelete.value.id}`, {
      method: 'DELETE'
    })

    // Close lightbox if we're deleting the current media
    if (lightboxOpen.value && currentMedia.value?.id === mediaToDelete.value.id) {
      closeLightbox()
    }

    await refreshMedia()
    closeDeleteModal()
  } catch (err: any) {
    console.error('Failed to delete media:', err)
  } finally {
    isDeleting.value = false
  }
}

useHead({
  title: computed(() => event.value ? `${event.value.name} - Media Gallery` : 'Event Dashboard - Media Gallery')
})
</script>
