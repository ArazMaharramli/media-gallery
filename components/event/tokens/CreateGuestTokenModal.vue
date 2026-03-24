<template>
  <CommonBaseModal :is-open="isOpen" title="Share with Permissions" size="md" @close="$emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Name (optional) -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
          Link Name <span class="text-gray-400">(optional)</span>
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          placeholder="e.g., Uncle Bob, Family Link"
          maxlength="50"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p class="mt-1 text-xs text-gray-500">A friendly name to identify who this link is for</p>
      </div>

      <!-- Permissions -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input
              v-model="form.canView"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700">Can view and download media</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              v-model="form.canUpload"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700">Can upload new media</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              v-model="form.canDelete"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700">Can delete shared media</span>
          </label>
        </div>
        <p class="mt-2 text-xs text-gray-500">
          Guests can always delete media they uploaded themselves.
        </p>
        <p v-if="!form.canView && !form.canUpload" class="mt-2 text-sm text-red-600">
          At least one permission must be enabled
        </p>
      </div>

      <!-- Selective Sharing (only if canView is enabled) -->
      <div v-if="form.canView && selectedMediaIds && selectedMediaIds.length > 0" class="p-3 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-700">
          <strong>Selective sharing:</strong> This link will only show {{ selectedMediaIds.length }} selected item(s)
        </p>
      </div>

      <!-- Error message -->
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    </form>

    <template #footer>
      <button
        type="button"
        @click="$emit('close')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        Cancel
      </button>
      <button
        @click="handleSubmit"
        :disabled="isSubmitting || (!form.canView && !form.canUpload)"
        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Creating...' : 'Create Link' }}
      </button>
    </template>
  </CommonBaseModal>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  selectedMediaIds?: string[]
  isSubmitting?: boolean
  error?: string | null
}

interface CreateGuestTokenInput {
  name?: string
  canView: boolean
  canUpload: boolean
  canDelete: boolean
  mediaIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedMediaIds: () => [],
  isSubmitting: false,
  error: null
})

const emit = defineEmits<{
  close: []
  submit: [data: CreateGuestTokenInput]
}>()

const form = reactive({
  name: '',
  canView: true,
  canUpload: false,
  canDelete: false
})

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    form.name = ''
    form.canView = true
    form.canUpload = false
    form.canDelete = false
  }
})

function handleSubmit() {
  if (!form.canView && !form.canUpload) return

  const data: CreateGuestTokenInput = {
    canView: form.canView,
    canUpload: form.canUpload,
    canDelete: form.canDelete
  }

  if (form.name.trim()) {
    data.name = form.name.trim()
  }

  // Include mediaIds only if canView and there are selected items
  if (form.canView && props.selectedMediaIds && props.selectedMediaIds.length > 0) {
    data.mediaIds = props.selectedMediaIds
  }

  emit('submit', data)
}
</script>
