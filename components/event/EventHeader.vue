<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ event?.name }}</h1>
        <p class="text-gray-500 mt-1">{{ formattedDate }}</p>
        <p v-if="event?.description" class="text-gray-600 mt-2">{{ event.description }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <!-- Share Gallery Button -->
        <button
          @click="$emit('shareGallery')"
          :disabled="isCreatingViewToken"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg v-if="isCreatingViewToken" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {{ shareButtonLabel }}
        </button>

        <!-- Share Links Toggle -->
        <button
          @click="$emit('toggleShareLinks')"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Share Links
          <span v-if="activeViewTokenCount > 0" class="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
            {{ activeViewTokenCount }}
          </span>
          <svg
            class="w-4 h-4 ml-2 transition-transform"
            :class="{ 'rotate-180': showShareLinks }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Upload Links Toggle -->
        <button
          @click="$emit('toggleUploadLinks')"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Upload Links
          <span v-if="activeUploadTokenCount > 0" class="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
            {{ activeUploadTokenCount }}
          </span>
          <svg
            class="w-4 h-4 ml-2 transition-transform"
            :class="{ 'rotate-180': showUploadLinks }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Upload Links Panel -->
    <div v-if="showUploadLinks" class="mt-6 pt-6 border-t">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-gray-900">Upload Links</h3>
        <button
          @click="$emit('createUploadLink')"
          class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Link
        </button>
      </div>
      <EventTokensUploadTokenList
        :tokens="uploadTokens"
        :deactivating-id="deactivatingUploadTokenId"
        @copy="$emit('copyUploadLink', $event)"
        @deactivate="$emit('deactivateUploadToken', $event)"
      />
    </div>

    <!-- Share Links Panel -->
    <div v-if="showShareLinks" class="mt-6 pt-6 border-t">
      <h3 class="text-sm font-semibold text-gray-900 mb-4">Share Links</h3>
      <EventTokensViewTokenList
        :tokens="viewTokens"
        :revoking-id="revokingViewTokenId"
        @copy="$emit('copyViewLink', $event)"
        @revoke="$emit('revokeViewToken', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Event {
  id: string
  name: string
  date: string
  description?: string
}

interface UploadToken {
  id: string
  eventId: string
  token: string
  name: string
  active: boolean
  createdAt: string
}

interface ViewToken {
  id: string
  eventId: string
  token: string
  active: boolean
  mediaIds: string[]
  createdAt: string
}

interface Props {
  event: Event | null
  uploadTokens: UploadToken[]
  viewTokens: ViewToken[]
  showUploadLinks: boolean
  showShareLinks: boolean
  isCreatingViewToken: boolean
  deactivatingUploadTokenId: string | null
  revokingViewTokenId: string | null
  selectedCount?: number
  selectionMode?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  shareGallery: []
  toggleShareLinks: []
  toggleUploadLinks: []
  createUploadLink: []
  copyUploadLink: [token: string]
  copyViewLink: [token: string]
  deactivateUploadToken: [tokenId: string]
  revokeViewToken: [tokenId: string]
}>()

const formattedDate = computed(() => {
  if (!props.event?.date) return ''
  return new Date(props.event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const activeViewTokenCount = computed(() =>
  props.viewTokens.filter(t => t.active).length
)

const activeUploadTokenCount = computed(() =>
  props.uploadTokens.filter(t => t.active).length
)

const shareButtonLabel = computed(() => {
  if (props.selectionMode && props.selectedCount && props.selectedCount > 0) {
    return `Share ${props.selectedCount} Selected`
  }
  return 'Share Gallery'
})
</script>
