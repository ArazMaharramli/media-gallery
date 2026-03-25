<template>
  <CommonBaseModal :is-open="isOpen" title="Share Gallery" @close="$emit('close')">
    <div class="space-y-4">
      <!-- QR Code -->
      <div class="flex justify-center">
        <div class="bg-white p-3 rounded-lg border">
          <canvas ref="qrCanvasRef" class="w-48 h-48"></canvas>
        </div>
      </div>

      <p class="text-sm text-gray-600 text-center">Scan or share this link with your clients:</p>

      <div class="flex items-center gap-2">
        <input
          type="text"
          readonly
          :value="shareLink"
          class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
        />
        <button
          @click="handleCopy"
          class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <!-- Social Sharing -->
      <div class="flex justify-center gap-3 pt-2">
        <!-- WhatsApp -->
        <a
          :href="whatsappUrl"
          target="_blank"
          class="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          title="Share via WhatsApp"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        <!-- Email -->
        <a
          :href="emailUrl"
          class="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          title="Share via Email"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>

        <!-- SMS -->
        <a
          :href="smsUrl"
          class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          title="Share via SMS"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </a>

        <!-- Download QR -->
        <button
          @click="handleDownloadQr"
          class="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
          title="Download QR Code"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  </CommonBaseModal>
</template>

<script setup lang="ts">
import QRCode from 'qrcode'

interface Props {
  isOpen: boolean
  shareLink: string
  eventName?: string
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  copy: []
}>()

const qrCanvasRef = ref<HTMLCanvasElement | null>(null)
const copied = ref(false)

// Computed URLs for sharing
const whatsappUrl = computed(() =>
  `https://wa.me/?text=${encodeURIComponent('Check out this gallery: ' + props.shareLink)}`
)

const emailUrl = computed(() =>
  `mailto:?subject=${encodeURIComponent((props.eventName || 'Photo') + ' Gallery')}&body=${encodeURIComponent('View the gallery here: ' + props.shareLink)}`
)

const smsUrl = computed(() =>
  `sms:?body=${encodeURIComponent('Check out this gallery: ' + props.shareLink)}`
)

// Generate QR code when modal opens
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && props.shareLink) {
    await nextTick()
    generateQrCode()
  }
})

// Also regenerate when shareLink changes
watch(() => props.shareLink, async () => {
  if (props.isOpen && props.shareLink) {
    await nextTick()
    generateQrCode()
  }
})

async function generateQrCode() {
  if (!qrCanvasRef.value || !props.shareLink) return

  try {
    await QRCode.toCanvas(qrCanvasRef.value, props.shareLink, {
      width: 192,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
  } catch (err) {
    console.error('Failed to generate QR code:', err)
  }
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.shareLink)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Fallback for browsers without clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = props.shareLink
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function handleDownloadQr() {
  if (!qrCanvasRef.value) return

  const link = document.createElement('a')
  link.download = `gallery-qr-${props.eventName || 'code'}.png`
  link.href = qrCanvasRef.value.toDataURL('image/png')
  link.click()
}
</script>
