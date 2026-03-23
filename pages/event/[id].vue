<template>
  <div class="space-y-6">
    <!-- Event Header -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">John & Jane Wedding</h1>
          <p class="text-gray-500 mt-1">June 15, 2024</p>
          <p class="text-gray-600 mt-2">A beautiful summer wedding celebration</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div class="space-y-2">
          <!-- Active Link with Name -->
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Uncle Bob</p>
                <p class="text-xs text-gray-500 font-mono">abc123def456gh78 · Mar 20, 2024</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="p-1.5 text-gray-400 hover:text-gray-600" title="Copy link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
              <button class="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">Deactivate</button>
            </div>
          </div>
          <!-- Another Active Link -->
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Wedding Party</p>
                <p class="text-xs text-gray-500 font-mono">mno456pqr789st12 · Mar 18, 2024</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="p-1.5 text-gray-400 hover:text-gray-600" title="Copy link">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
              <button class="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">Deactivate</button>
            </div>
          </div>
          <!-- Inactive Link -->
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
              <div>
                <p class="text-sm font-semibold text-gray-500">Bridesmaids</p>
                <p class="text-xs text-gray-400 font-mono">xyz789abc123de45 · Mar 15, 2024 · Deactivated</p>
              </div>
            </div>
            <span class="text-xs text-gray-400 px-2 py-1">Inactive</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">Share upload links with guests so they can contribute photos and videos. The name helps identify who uploaded the media.</p>
      </div>
    </div>

    <!-- New Link Modal -->
    <div v-if="showNewLinkModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-30" @click="showNewLinkModal = false"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Create Upload Link</h3>
            <button @click="showNewLinkModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
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
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showNewLinkModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              :disabled="!newLinkName.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Link
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Zone -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Upload Media</h2>
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="mt-2 text-sm text-gray-600">
          <span class="font-medium text-indigo-600">Click to upload</span> or drag and drop
        </p>
        <p class="mt-1 text-xs text-gray-500">
          JPG, PNG, GIF, WEBP, MP4, MOV, WEBM up to 500MB
        </p>
      </div>

      <!-- Upload Queue (placeholder) -->
      <div class="mt-4 space-y-2">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">IMG_001.jpg</p>
              <p class="text-xs text-gray-500">2.4 MB</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div class="bg-indigo-600 h-2 rounded-full" style="width: 75%"></div>
            </div>
            <span class="text-sm text-gray-600">75%</span>
            <button class="text-gray-400 hover:text-red-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Grid -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Media (12 items)</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <!-- Sample Media Items (placeholders) -->
        <div v-for="i in 12" :key="i" class="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
          <div class="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg v-if="i % 3 === 0" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <!-- Uploader Badge -->
          <div v-if="i % 4 === 1" class="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded">
            Uncle Bob
          </div>
          <div v-if="i % 4 === 2" class="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded">
            Wedding Party
          </div>
          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex gap-2">
              <button class="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button class="p-2 bg-white rounded-full shadow-lg hover:bg-red-50">
                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const eventId = route.params.id

const showUploadLinks = ref(false)
const showNewLinkModal = ref(false)
const newLinkName = ref('')

useHead({
  title: 'Event Dashboard - Media Gallery'
})
</script>
