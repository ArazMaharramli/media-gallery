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
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-modal="true"
        role="dialog"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black bg-opacity-30"
            @click="handleBackdropClick"
          ></div>

          <!-- Modal Content -->
          <div
            class="relative bg-white rounded-lg shadow-xl w-full p-6"
            :class="sizeClasses"
          >
            <!-- Header -->
            <div v-if="title || $slots.header" class="flex items-center justify-between mb-4">
              <slot name="header">
                <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
              </slot>
              <button
                v-if="showClose"
                @click="close"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="modal-body">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="mt-6 flex justify-end gap-3">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  close: []
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'max-w-sm'
    case 'md': return 'max-w-md'
    case 'lg': return 'max-w-lg'
    case 'xl': return 'max-w-xl'
    default: return 'max-w-md'
  }
})

function close() {
  emit('close')
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}

// Handle escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      close()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>
