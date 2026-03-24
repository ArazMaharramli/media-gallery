<template>
  <div class="space-y-2">
    <div v-if="tokens.length === 0" class="text-center py-4 text-gray-500 text-sm">
      No upload links yet. Create one to let guests upload media.
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
            <p class="text-sm font-semibold" :class="token.active ? 'text-gray-900' : 'text-gray-500'">
              {{ token.name }}
            </p>
            <p class="text-xs font-mono" :class="token.active ? 'text-gray-500' : 'text-gray-400'">
              {{ token.token }} · {{ formatDate(token.createdAt) }}
              <span v-if="!token.active"> · Deactivated</span>
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
            @click="$emit('deactivate', token.id)"
            :disabled="deactivatingId === token.id"
            class="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
          >
            {{ deactivatingId === token.id ? 'Deactivating...' : 'Deactivate' }}
          </button>
        </div>
        <span v-else class="text-xs text-gray-400 px-2 py-1">Inactive</span>
      </div>
    </div>
    <p class="text-xs text-gray-500 mt-3">
      Share upload links with guests so they can contribute photos and videos.
      The name helps identify who uploaded the media.
    </p>
  </div>
</template>

<script setup lang="ts">
interface UploadToken {
  id: string
  eventId: string
  token: string
  name: string
  active: boolean
  createdAt: string
}

interface Props {
  tokens: UploadToken[]
  deactivatingId: string | null
}

defineProps<Props>()

defineEmits<{
  copy: [token: string]
  deactivate: [tokenId: string]
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>
