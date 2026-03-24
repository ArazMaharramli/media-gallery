<template>
  <div
    @click="handleClick"
    class="group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
    :class="{ 'ring-2 ring-indigo-500 ring-offset-2': isSelected }"
  >
    <!-- Thumbnail -->
    <img
      v-if="!showPlaceholder && thumbnailUrl"
      :src="thumbnailUrl"
      :alt="media.originalName"
      class="absolute inset-0 w-full h-full object-cover"
      @error="handleThumbnailError"
    />

    <!-- Fallback placeholder when thumbnail fails or not available -->
    <div
      v-if="showPlaceholder"
      class="absolute inset-0 flex items-center justify-center bg-gray-200"
    >
      <svg v-if="media.type === 'video'" class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <svg v-else class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>

    <!-- Video play overlay -->
    <div
      v-if="media.type === 'video'"
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div class="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
        <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      </div>
    </div>

    <!-- Selection Overlay -->
    <div
      v-if="selectionMode && isSelected"
      class="absolute inset-0 bg-indigo-600/30 pointer-events-none"
    ></div>

    <!-- Selection Checkbox -->
    <div v-if="selectionMode" class="absolute top-2 left-2 z-10">
      <div
        class="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-md"
        :class="isSelected ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-white/90 border-gray-400'"
      >
        <svg v-if="isSelected" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <!-- Preview Button (selection mode) -->
    <button
      v-if="selectionMode"
      @click.stop="$emit('preview')"
      class="absolute top-2 right-2 z-10 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors shadow-md"
      title="Preview"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </button>

    <!-- Uploader Badge -->
    <div
      v-if="uploaderName"
      class="absolute bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded z-10"
      :class="selectionMode ? 'bottom-2 left-2' : 'top-2 left-2'"
    >
      {{ uploaderName }}
    </div>

    <!-- Video Badge -->
    <div
      v-if="media.type === 'video'"
      class="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1 z-10"
    >
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
      </svg>
      Video
    </div>

    <!-- Hover Overlay (non-selection mode) -->
    <div
      v-if="!selectionMode"
      class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
    >
      <div class="flex gap-2">
        <span class="p-2 bg-white rounded-full shadow-lg">
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </span>
        <button
          @click.stop="$emit('delete')"
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
</template>

<script setup lang="ts">
interface Media {
  id: string
  eventId: string
  uploadTokenId: string | null
  filename: string
  originalName: string
  type: 'photo' | 'video'
  thumbnail?: string | null
}

interface Props {
  media: Media
  selectionMode?: boolean
  isSelected?: boolean
  uploaderName?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  selectionMode: false,
  isSelected: false
})

const emit = defineEmits<{
  click: []
  preview: []
  delete: []
  select: []
}>()

const thumbnailError = ref(false)

// For videos without thumbnails, show placeholder immediately
const showPlaceholder = computed(() => {
  if (thumbnailError.value) return true
  // Videos without a thumbnail can't use the original file as img src
  if (props.media.type === 'video' && !props.media.thumbnail) return true
  return false
})

const thumbnailUrl = computed(() => {
  const baseUrl = `/api/uploads/${props.media.eventId}`
  if (props.media.thumbnail) {
    return `${baseUrl}/${props.media.thumbnail}`
  }
  // For images, fall back to original file
  if (props.media.type === 'photo') {
    return `${baseUrl}/${props.media.filename}`
  }
  // For videos without thumbnail, return empty (placeholder will show)
  return ''
})

function handleClick() {
  if (props.selectionMode) {
    emit('select')
  } else {
    emit('click')
  }
}

function handleThumbnailError() {
  thumbnailError.value = true
}
</script>
