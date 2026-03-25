<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen && currentMedia"
        class="fixed inset-0 z-50 bg-black"
      >
        <!-- Close Button -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Custom Actions Slot -->
        <div v-if="$slots.actions" class="absolute top-4 right-16 z-10 flex items-center gap-1">
          <slot name="actions" />
        </div>

        <!-- Navigation - Previous -->
        <button
          v-if="hasPrev"
          @click="$emit('prev')"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Navigation - Next -->
        <button
          v-if="hasNext"
          @click="$emit('next')"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Media Content -->
        <div class="absolute inset-0 flex items-center justify-center p-16">
          <!-- Photo -->
          <img
            v-if="currentMedia.type === 'photo'"
            :src="previewUrl"
            :alt="currentMedia.originalName"
            class="max-w-full max-h-full object-contain"
          />

          <!-- Video with next-gen format support -->
          <video
            v-else
            ref="videoPlayerRef"
            :key="currentMedia.id"
            :poster="thumbnailUrl"
            controls
            playsinline
            class="max-w-full max-h-full"
          >
            <!-- WebM preview (next-gen, preferred) -->
            <source
              v-if="currentMedia.preview"
              :src="currentMedia.preview"
              type="video/webm"
            />
            <!-- MP4 preview (fallback) -->
            <source
              v-if="currentMedia.previewFallback"
              :src="currentMedia.previewFallback"
              type="video/mp4"
            />
            <!-- Original file as final fallback -->
            <source
              :src="originalUrl"
              :type="currentMedia.mimeType"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        <!-- Bottom Bar -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div class="flex items-center justify-between text-white">
            <div>
              <p class="font-medium">{{ currentMedia.originalName }}</p>
              <p class="text-sm text-gray-300">
                {{ currentIndex + 1 }} of {{ totalCount }}
              </p>
            </div>
            <a
              :href="downloadUrl"
              download
              class="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { MediaOutput } from '~/shared/schemas'

interface Props {
  isOpen: boolean
  currentMedia: MediaOutput | null
  currentIndex: number
  totalCount: number
  hasPrev: boolean
  hasNext: boolean
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  prev: []
  next: []
}>()

const videoPlayerRef = ref<HTMLVideoElement | null>(null)

const previewUrl = computed(() => {
  if (!props.currentMedia) return ''
  return props.currentMedia.preview || props.currentMedia.previewFallback || props.currentMedia.filename
})

const thumbnailUrl = computed(() => {
  if (!props.currentMedia) return ''
  return props.currentMedia.thumbnail || props.currentMedia.thumbnailFallback || ''
})

const originalUrl = computed(() => {
  if (!props.currentMedia) return ''
  return props.currentMedia.filename
})

const downloadUrl = computed(() => originalUrl.value)

// Pause video when media changes
watch(() => props.currentIndex, () => {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.pause()
  }
})

// Expose video player ref
defineExpose({
  videoPlayerRef
})
</script>
