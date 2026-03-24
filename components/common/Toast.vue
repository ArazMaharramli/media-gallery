<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="show"
        class="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
      >
        <!-- Success Icon -->
        <svg v-if="type === 'success'" class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>

        <!-- Error Icon -->
        <svg v-else-if="type === 'error'" class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>

        <!-- Info Icon -->
        <svg v-else class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

        <span>{{ message }}</span>

        <button
          v-if="dismissible"
          @click="$emit('hide')"
          class="ml-2 text-gray-400 hover:text-white"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 3000,
  dismissible: false
})

const emit = defineEmits<{
  hide: []
}>()

// Auto-dismiss after duration
watch(() => props.show, (isVisible) => {
  if (isVisible && props.duration > 0) {
    setTimeout(() => {
      emit('hide')
    }, props.duration)
  }
})
</script>
