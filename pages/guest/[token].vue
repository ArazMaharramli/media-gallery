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
                {{ allMedia.length }}
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
            </span>
          </button>
        </nav>
      </div>

      <!-- Gallery Tab Content -->
      <div v-if="canShowGallery && activeTab === 'gallery'" class="p-6">
        <!-- Toolbar -->
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ allMedia.length }}</span> items
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
        <div v-if="allMedia.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="mt-2 text-sm text-gray-500">No media in this gallery yet</p>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="(item, index) in allMedia"
            :key="item.id"
            @click="openLightbox(index)"
            class="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all"
          >
            <!-- Thumbnail Image -->
            <img
              v-if="!shouldShowPlaceholder(item) && getThumbnailUrl(item)"
              :src="getThumbnailUrl(item)"
              :alt="item.originalName"
              class="absolute inset-0 w-full h-full object-cover"
              @error="handleThumbnailError(item)"
            />

            <!-- Placeholder for videos without thumbnails or failed loads -->
            <div
              v-if="shouldShowPlaceholder(item)"
              class="absolute inset-0 flex items-center justify-center bg-gray-200"
            >
              <svg v-if="item.type === 'video'" class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Video play overlay -->
            <div
              v-if="item.type === 'video'"
              class="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div class="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
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
              v-if="canDeleteItem(item)"
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
        <div v-else class="divide-y border rounded-lg overflow-hidden">
          <div
            v-for="(item, index) in allMedia"
            :key="item.id"
            @click="openLightbox(index)"
            class="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
              <img
                v-if="!shouldShowPlaceholder(item) && getThumbnailUrl(item)"
                :src="getThumbnailUrl(item)"
                :alt="item.originalName"
                class="w-full h-full object-cover"
                @error="handleThumbnailError(item)"
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
                v-if="canDeleteItem(item)"
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
      </div>

      <!-- Upload Tab Content -->
      <div v-if="permissions?.canUpload && activeTab === 'upload'" class="p-6">
        <div class="flex flex-col md:flex-row md:items-stretch gap-6">
          <!-- Upload Section -->
          <div class="flex-1 flex flex-col">
            <!-- Drop Zone -->
            <div
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="openFileDialog"
              class="flex-1 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[240px]"
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
              <svg
                class="mx-auto h-12 w-12"
                :class="isDragging ? 'text-indigo-500' : 'text-gray-400'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
                  v-if="hasCompletedOrError"
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
                  <svg v-if="item.isVideo" class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg v-else class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <!-- File Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(item.size) }}</p>

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
        title="Download original"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>
      <button
        v-if="currentMedia && canDeleteItem(currentMedia)"
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
        :src="getPreviewUrl(currentMedia)"
        :alt="currentMedia.originalName"
        class="max-h-[90vh] max-w-[90vw] object-contain"
      />
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {{ currentMediaIndex + 1 }} / {{ allMedia.length }}
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
        title="Download original"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>
      <button
        v-if="currentMedia && canDeleteItem(currentMedia)"
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
        :poster="getPreviewUrl(currentMedia) || undefined"
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
  guestTokenId: string | null
  filename: string
  originalName: string
  mimeType: string
  size: number
  type: 'photo' | 'video'
  thumbnail?: string | null
  thumbnailFallback?: string | null
  preview?: string | null
  previewFallback?: string | null
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
const sharedMediaList = ref<Media[]>([])
const ownUploadsList = ref<Media[]>([])
const thumbnailErrors = ref<Set<string>>(new Set())
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Upload queue state
interface UploadQueueItem {
  id: string
  file: File
  name: string
  size: number
  isVideo: boolean
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
  xhr?: XMLHttpRequest
}
const uploadQueue = ref<UploadQueueItem[]>([])
const isProcessingQueue = ref(false)

const hasCompletedOrError = computed(() =>
  uploadQueue.value.some(f => f.status === 'completed' || f.status === 'error')
)

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
const tokenId = computed(() => response.value?.data?.tokenId || null)

// Shared media (from canView permission)
const sharedMedia = computed<Media[]>(() =>
  sharedMediaList.value.length > 0 ? sharedMediaList.value : (response.value?.data?.media || [])
)

// Own uploads (media uploaded by this guest)
const ownUploads = computed<Media[]>(() =>
  ownUploadsList.value.length > 0 ? ownUploadsList.value : (response.value?.data?.ownUploads || [])
)

// Filter out own uploads from shared media to avoid duplicates, then combine
const allMedia = computed<Media[]>(() => {
  const ownIds = new Set(ownUploads.value.map(m => m.id))
  const filteredShared = sharedMedia.value.filter(m => !ownIds.has(m.id))
  return [...filteredShared, ...ownUploads.value]
})

// Should show gallery tab (has shared media OR has own uploads)
const canShowGallery = computed(() =>
  permissions.value?.canView || ownUploads.value.length > 0
)

// Sync media lists when response changes
watch(() => response.value?.data?.media, (newMedia) => {
  if (newMedia) {
    sharedMediaList.value = [...newMedia]
  }
}, { immediate: true })

watch(() => response.value?.data?.ownUploads, (newUploads) => {
  if (newUploads) {
    ownUploadsList.value = [...newUploads]
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

// Lightbox computed
const currentMedia = computed(() => allMedia.value[currentMediaIndex.value])
const hasPrevMedia = computed(() => currentMediaIndex.value > 0)
const hasNextMedia = computed(() => currentMediaIndex.value < allMedia.value.length - 1)

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

// Get thumbnail URL for grid view (optimized for performance)
function getThumbnailUrl(item: Media): string {
  const baseUrl = `/api/uploads/${item.eventId}`
  // Use thumbnail (WebP) first, then fallback to original JPEG thumbnail
  if (item.thumbnail) {
    return `${baseUrl}/${item.thumbnail}`
  }
  if (item.thumbnailFallback) {
    return `${baseUrl}/${item.thumbnailFallback}`
  }
  // For photos, fall back to original file
  if (item.type === 'photo') {
    return `${baseUrl}/${item.filename}`
  }
  // Videos without thumbnails return empty (show placeholder)
  return ''
}

// Get preview URL for lightbox view (medium-sized optimized image)
function getPreviewUrl(item: Media): string {
  const baseUrl = `/api/uploads/${item.eventId}`
  // Use preview (WebP) first, then fallback
  if (item.preview) {
    return `${baseUrl}/${item.preview}`
  }
  if (item.previewFallback) {
    return `${baseUrl}/${item.previewFallback}`
  }
  // For videos, try thumbnail as fallback for poster (don't use video file as image)
  if (item.type === 'video') {
    if (item.thumbnail) {
      return `${baseUrl}/${item.thumbnail}`
    }
    if (item.thumbnailFallback) {
      return `${baseUrl}/${item.thumbnailFallback}`
    }
    // No preview available for video
    return ''
  }
  // For photos, fall back to original
  return `${baseUrl}/${item.filename}`
}

// Check if item should show placeholder (video without thumbnail or failed load)
function shouldShowPlaceholder(item: Media): boolean {
  if (thumbnailErrors.value.has(item.id)) return true
  // Videos without thumbnails can't use original as img src
  if (item.type === 'video' && !item.thumbnail && !item.thumbnailFallback) return true
  return false
}

// Handle thumbnail load error
function handleThumbnailError(item: Media) {
  thumbnailErrors.value.add(item.id)
}

// Check if guest can delete a specific item
// Guests can delete if: they have canDelete permission OR it's their own upload
function canDeleteItem(item: Media): boolean {
  // Own upload - always deletable
  if (item.guestTokenId && item.guestTokenId === tokenId.value) {
    return true
  }
  // Shared media - only if canDelete permission
  return permissions.value?.canDelete === true
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

// File upload functions
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm'
]
const MAX_FILE_SIZE = 500 * 1024 * 1024

function openFileDialog() {
  fileInputRef.value?.click()
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    addFilesToQueue(Array.from(input.files))
    input.value = ''
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    addFilesToQueue(Array.from(files))
  }
}

function addFilesToQueue(files: File[]) {
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) continue
    if (file.size > MAX_FILE_SIZE) continue

    uploadQueue.value.push({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      isVideo: file.type.startsWith('video'),
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

  const formData = new FormData()
  formData.append('file', item.file)

  try {
    const result = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      item.xhr = xhr

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          item.progress = Math.round((e.loaded / e.total) * 100)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            resolve({ data: null })
          }
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

      xhr.open('POST', `/api/guest/${token}/upload`)
      xhr.send(formData)
    })

    item.status = 'completed'
    item.progress = 100

    // Add the new upload to ownUploadsList
    if (result?.data) {
      ownUploadsList.value = [result.data, ...ownUploadsList.value]
    }
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
  if (item?.xhr) {
    item.xhr.abort()
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
    // Remove from both lists
    sharedMediaList.value = sharedMediaList.value.filter(m => m.id !== mediaId)
    ownUploadsList.value = ownUploadsList.value.filter(m => m.id !== mediaId)
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
