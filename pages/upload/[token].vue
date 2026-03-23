<template>
  <div class="max-w-2xl mx-auto">
    <!-- Event Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">John & Jane Wedding</h1>
      <p class="text-gray-500 mt-1">June 15, 2024</p>
    </div>

    <!-- Instructions -->
    <div class="bg-blue-50 rounded-lg p-4 mb-6">
      <p class="text-blue-800 text-center">
        Share your photos and videos from the event! Drag files here or click to browse.
      </p>
    </div>

    <!-- Upload Options Tabs -->
    <div class="bg-white rounded-lg shadow-sm border mb-6 overflow-hidden">
      <div class="flex border-b">
        <button
          @click="activeTab = 'upload'"
          :class="[
            'flex-1 px-4 py-3 text-sm font-medium text-center transition-colors',
            activeTab === 'upload'
              ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          ]"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Here
        </button>
        <button
          @click="activeTab = 'qr'"
          :class="[
            'flex-1 px-4 py-3 text-sm font-medium text-center transition-colors',
            activeTab === 'qr'
              ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          ]"
        >
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan QR Code
        </button>
      </div>

      <!-- Upload Zone Tab -->
      <div v-if="activeTab === 'upload'" class="p-6">
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

      <!-- QR Code Tab -->
      <div v-if="activeTab === 'qr'" class="p-6">
        <div class="text-center">
          <div class="inline-block p-4 bg-white border rounded-xl shadow-sm">
            <ClientOnly>
              <QRCodeVue :value="uploadUrl" :size="200" level="M" />
              <template #fallback>
                <div class="w-[200px] h-[200px] bg-gray-100 rounded flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </template>
            </ClientOnly>
          </div>
          <p class="mt-4 text-gray-600 font-medium">Scan with your phone camera</p>
          <p class="mt-1 text-sm text-gray-500">Open this page on your mobile device to upload photos directly from your phone</p>

          <!-- Copy Link Button -->
          <div class="mt-4 flex items-center justify-center gap-2">
            <input
              type="text"
              readonly
              :value="uploadUrl"
              class="flex-1 max-w-xs px-3 py-2 text-sm border rounded-lg bg-gray-50 text-gray-600 truncate"
            />
            <button
              @click="copyLink"
              class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <svg v-else class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Queue -->
    <div v-if="activeTab === 'upload'" class="bg-white rounded-lg shadow-sm border p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Upload Queue</h2>

      <div class="space-y-3">
        <!-- Uploading Item -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center">
              <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">IMG_001.jpg</p>
              <p class="text-xs text-gray-500">2.4 MB</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-24 bg-gray-200 rounded-full h-2">
              <div class="bg-indigo-600 h-2 rounded-full transition-all" style="width: 80%"></div>
            </div>
            <span class="text-sm text-gray-600 w-10">80%</span>
            <button class="text-gray-400 hover:text-red-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Waiting Item -->
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">VID_002.mp4</p>
              <p class="text-xs text-gray-500">45 MB</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Waiting...</span>
            <button class="text-gray-400 hover:text-red-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Completed Item -->
        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">IMG_003.jpg</p>
              <p class="text-xs text-gray-500">1.8 MB</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-green-600">Complete</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="hidden text-center py-8 text-gray-500">
        <p>No files in queue. Select files to upload.</p>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="activeTab === 'upload'" class="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
      <svg class="mx-auto h-8 w-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-green-800 font-medium">Thank you for sharing!</p>
      <p class="text-green-600 text-sm mt-1">Your files have been uploaded successfully.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCodeVue from 'qrcode.vue'

const route = useRoute()
const token = route.params.token

const activeTab = ref<'upload' | 'qr'>('upload')
const copied = ref(false)

const uploadUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/upload/${token}`
  }
  return `/upload/${token}`
})

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(uploadUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

useHead({
  title: 'Upload - Media Gallery'
})
</script>
