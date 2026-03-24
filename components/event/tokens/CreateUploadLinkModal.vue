<template>
  <CommonBaseModal :is-open="isOpen" title="Create Upload Link" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="linkName" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          id="linkName"
          v-model="name"
          type="text"
          placeholder="e.g., Uncle Bob, Wedding Party"
          maxlength="50"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p class="mt-1 text-xs text-gray-500">This name will identify who uploaded the media.</p>
      </div>

      <div v-if="error" class="text-sm text-red-600">{{ error }}</div>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="handleClose"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="!name.trim() || isCreating"
          class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isCreating ? 'Creating...' : 'Create Link' }}
        </button>
      </div>
    </form>
  </CommonBaseModal>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  isCreating: boolean
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  create: [name: string]
}>()

const name = ref('')

function handleClose() {
  name.value = ''
  emit('close')
}

function handleSubmit() {
  if (!name.value.trim()) return
  emit('create', name.value.trim())
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    name.value = ''
  }
})
</script>
