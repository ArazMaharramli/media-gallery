/**
 * Lightbox composable
 * Manages lightbox state for viewing media fullscreen
 */
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { MediaOutput } from '~/shared/schemas'

export interface LightboxItem {
  id: string
  type: 'photo' | 'video'
  filename: string
  originalName: string
  preview?: string | null
  thumbnail?: string | null
}

export function useLightbox<T extends LightboxItem>(items: Ref<T[]>) {
  const isOpen = ref(false)
  const currentIndex = ref(0)
  const videoPlayerRef = ref<HTMLVideoElement | null>(null)

  // Current item
  const currentItem = computed(() => items.value[currentIndex.value])

  // Navigation state
  const hasPrev = computed(() => currentIndex.value > 0)
  const hasNext = computed(() => currentIndex.value < items.value.length - 1)

  // Open lightbox at specific index
  function open(index: number) {
    currentIndex.value = index
    isOpen.value = true
    document.body.style.overflow = 'hidden'
  }

  // Close lightbox
  function close() {
    isOpen.value = false
    document.body.style.overflow = ''
    if (videoPlayerRef.value) {
      videoPlayerRef.value.pause()
    }
  }

  // Navigate to previous item
  function prev() {
    if (hasPrev.value) {
      pauseVideo()
      currentIndex.value--
    }
  }

  // Navigate to next item
  function next() {
    if (hasNext.value) {
      pauseVideo()
      currentIndex.value++
    }
  }

  // Go to specific index
  function goTo(index: number) {
    if (index >= 0 && index < items.value.length) {
      pauseVideo()
      currentIndex.value = index
    }
  }

  // Pause current video if playing
  function pauseVideo() {
    if (videoPlayerRef.value) {
      videoPlayerRef.value.pause()
    }
  }

  // Keyboard navigation handler
  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen.value) return

    switch (e.key) {
      case 'Escape':
        close()
        break
      case 'ArrowLeft':
        prev()
        break
      case 'ArrowRight':
        next()
        break
    }
  }

  // Set up keyboard listeners
  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
  })

  return {
    // State
    isOpen,
    currentIndex,
    currentItem,
    hasPrev,
    hasNext,
    videoPlayerRef,

    // Actions
    open,
    close,
    prev,
    next,
    goTo
  }
}
