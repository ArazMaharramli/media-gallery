<template>
  <div class="space-y-3">
    <div v-if="tokens.length === 0" class="text-center py-8 text-gray-500">
      <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      <p class="text-sm">No active share links</p>
      <p class="text-xs mt-1">Use the "Share" button above to create a link</p>
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="token in tokens"
        :key="token.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p v-if="token.name" class="text-sm font-semibold text-gray-900">
              {{ token.name }}
            </p>
            <p class="text-sm font-mono text-gray-600 truncate">
              {{ token.token }}
            </p>
          </div>
          <div class="flex items-center gap-1.5 mt-1 flex-wrap">
            <!-- Permission badges -->
            <span
              v-if="token.canView"
              class="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700"
            >
              View
            </span>
            <span
              v-if="token.canUpload"
              class="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700"
            >
              Upload
            </span>
            <span
              v-if="token.canDelete"
              class="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700"
            >
              Delete
            </span>
            <!-- Media count for selective sharing -->
            <span
              v-if="token.canView && token.mediaIds && token.mediaIds.length > 0"
              class="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700"
            >
              {{ token.mediaIds.length }} items
            </span>
            <span class="text-xs text-gray-400">
              · {{ formatDate(token.createdAt) }}
            </span>
            <span v-if="token.expiresAt" class="text-xs text-gray-400">
              · Expires {{ formatDate(token.expiresAt) }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2 ml-4">
          <button
            @click="$emit('copy', token.token)"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
            title="Copy link"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
          <button
            @click="$emit('revoke', token.id)"
            :disabled="revokingId === token.id"
            class="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
          >
            {{ revokingId === token.id ? 'Revoking...' : 'Revoke' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GuestToken {
  id: string
  eventId: string
  token: string
  name: string | null
  active: boolean
  canView: boolean
  canUpload: boolean
  canDelete: boolean
  mediaIds: string[]
  expiresAt: string | null
  createdAt: string
}

interface Props {
  tokens: GuestToken[]
  revokingId: string | null
}

defineProps<Props>()

defineEmits<{
  copy: [token: string]
  revoke: [tokenId: string]
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>
