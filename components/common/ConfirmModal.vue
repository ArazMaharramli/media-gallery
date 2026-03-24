<template>
  <CommonBaseModal
    :is-open="isOpen"
    :title="title"
    size="sm"
    @close="$emit('cancel')"
  >
    <p class="text-gray-600">{{ message }}</p>

    <template #footer>
      <button
        @click="$emit('cancel')"
        :disabled="isLoading"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {{ cancelText }}
      </button>
      <button
        @click="$emit('confirm')"
        :disabled="isLoading"
        class="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
        :class="confirmButtonClasses"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ confirmText }}
      </button>
    </template>
  </CommonBaseModal>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
  isLoading: false
})

defineEmits<{
  confirm: []
  cancel: []
}>()

const confirmButtonClasses = computed(() => {
  if (props.variant === 'danger') {
    return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
  }
  return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
})
</script>
