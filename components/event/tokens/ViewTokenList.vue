<template>
  <div class="space-y-2">
    <div v-if="tokens.length === 0" class="text-center py-4 text-gray-500 text-sm">
      No share links yet. Click "Share Gallery" to create one.
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="token in tokens"
        :key="token.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        :class="{ 'opacity-60': !token.active }"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-2 h-2 rounded-full flex-shrink-0"
            :class="token.active ? 'bg-green-500' : 'bg-gray-400'"
          ></div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-mono" :class="token.active ? 'text-gray-900' : 'text-gray-500'">
                {{ token.token }}
              </p>
              <span
                class="text-xs px-1.5 py-0.5 rounded"
                :class="token.active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'"
              >
                {{ token.mediaIds && token.mediaIds.length > 0 ? `${token.mediaIds.length} items` : 'All media' }}
              </span>
            </div>
            <p class="text-xs" :class="token.active ? 'text-gray-500' : 'text-gray-400'">
              {{ formatDate(token.createdAt) }}
              <span v-if="!token.active"> · Revoked</span>
            </p>
          </div>
        </div>
        <div v-if="token.active" class="flex items-center gap-2">
          <button
            @click="$emit('copy', token.token)"
            class="p-1.5 text-gray-400 hover:text-gray-600"
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
        <span v-else class="text-xs text-gray-400 px-2 py-1">Revoked</span>
      </div>
    </div>
    <p class="text-xs text-gray-500 mt-3">
      Share links allow clients to view your gallery. Revoke links to prevent further access.
    </p>
  </div>
</template>

<script setup lang="ts">
interface ViewToken {
  id: string
  eventId: string
  token: string
  active: boolean
  mediaIds: string[]
  createdAt: string
}

interface Props {
  tokens: ViewToken[]
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
