<template>
  <div class="p-6">
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
        :accept="acceptTypes"
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
          @click="$emit('clearCompleted')"
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
          <svg v-if="isVideo(item.file)" class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            @click="$emit('cancel', item.id)"
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
              @click="$emit('retry', item.id)"
              class="p-1 text-gray-400 hover:text-indigo-500"
              title="Retry"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              @click="$emit('remove', item.id)"
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
</template>

<script setup lang="ts">
interface UploadQueueItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
}

interface Props {
  uploadQueue: UploadQueueItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addFiles: [files: File[]]
  cancel: [id: string]
  retry: [id: string]
  remove: [id: string]
  clearCompleted: []
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const acceptTypes = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm'

const hasCompletedOrError = computed(() =>
  props.uploadQueue.some(f => f.status === 'completed' || f.status === 'error')
)

function isVideo(file: File): boolean {
  return file.type.startsWith('video')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    emit('addFiles', Array.from(files))
  }
}

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    emit('addFiles', Array.from(input.files))
    input.value = '' // Reset input for re-selection
  }
}
</script>
