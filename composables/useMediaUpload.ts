/**
 * Media upload composable
 * Manages upload queue and file upload operations
 * Supports both standard XHR uploads and chunked tus uploads for large files
 */
import { ref, computed, watch } from 'vue'
import { formatFileSize } from '~/utils/formatters'
import { useChunkedUpload } from './useChunkedUpload'
import { useUploadStrategy } from './useUploadStrategy'

export interface UploadQueueItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error'
  progress: number
  bytesUploaded?: number
  error?: string
  abortController?: AbortController
  isChunked: boolean
  tusUploadId?: string
}

export interface MediaUploadOptions {
  metadata?: Record<string, string>
}

export function useMediaUpload(
  uploadUrl: string,
  onUploadComplete?: () => void,
  options?: MediaUploadOptions
) {
  const uploadQueue = ref<UploadQueueItem[]>([])
  const isProcessingQueue = ref(false)
  const isDragging = ref(false)

  // Initialize chunked upload and strategy composables
  const chunkedUpload = useChunkedUpload('/api/tus')
  const { shouldUseChunkedUpload, isFileSizeValid, formatMaxSize } = useUploadStrategy()

  // Computed
  const hasActiveUploads = computed(() =>
    uploadQueue.value.some(
      item => item.status === 'uploading' || item.status === 'pending' || item.status === 'paused'
    )
  )

  const completedCount = computed(() =>
    uploadQueue.value.filter(item => item.status === 'completed').length
  )

  const errorCount = computed(() =>
    uploadQueue.value.filter(item => item.status === 'error').length
  )

  // Watch chunked uploads for status changes
  watch(
    () => chunkedUpload.uploads.value,
    (tusUploads) => {
      for (const tusUpload of tusUploads) {
        // Find corresponding queue item
        const queueItem = uploadQueue.value.find(item => item.tusUploadId === tusUpload.id)
        if (!queueItem) continue

        // Update queue item with tus upload status
        const index = uploadQueue.value.findIndex(item => item.id === queueItem.id)
        if (index === -1) continue

        uploadQueue.value[index] = {
          ...uploadQueue.value[index],
          status: tusUpload.status,
          progress: tusUpload.progress,
          bytesUploaded: tusUpload.bytesUploaded,
          error: tusUpload.error
        }

        // Call completion callback when finished
        if (tusUpload.status === 'completed' && queueItem.status !== 'completed') {
          onUploadComplete?.()
        }
      }
    },
    { deep: true }
  )

  /**
   * Add files to the upload queue
   */
  function addFiles(files: File[]) {
    const newItems: UploadQueueItem[] = []

    for (const file of files) {
      // Check if file size is valid
      if (!isFileSizeValid(file)) {
        const isChunked = shouldUseChunkedUpload(file)
        // Add as error item
        newItems.push({
          id: `upload-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          file,
          status: 'error',
          progress: 0,
          error: `File too large. Maximum size is ${formatMaxSize(isChunked)}`,
          isChunked
        })
        continue
      }

      const isChunked = shouldUseChunkedUpload(file)

      newItems.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file,
        status: 'pending',
        progress: 0,
        isChunked
      })
    }

    uploadQueue.value = [...uploadQueue.value, ...newItems]

    // Start processing if not already
    if (!isProcessingQueue.value) {
      processQueue()
    }
  }

  /**
   * Process the upload queue (one at a time for max speed)
   */
  async function processQueue() {
    if (isProcessingQueue.value) return
    isProcessingQueue.value = true

    while (true) {
      // Find next pending item
      const pendingItem = uploadQueue.value.find(item => item.status === 'pending')
      if (!pendingItem) break

      if (pendingItem.isChunked) {
        await uploadChunkedFile(pendingItem)
      } else {
        await uploadStandardFile(pendingItem)
      }
    }

    isProcessingQueue.value = false
  }

  /**
   * Upload a file using chunked/tus protocol
   */
  async function uploadChunkedFile(item: UploadQueueItem) {
    const index = uploadQueue.value.findIndex(i => i.id === item.id)
    if (index === -1) return

    // Create tus upload with metadata (async for checksum calculation)
    const tusId = await chunkedUpload.createUpload(item.file, options?.metadata || {})

    // Update queue item with tus upload ID and status
    uploadQueue.value[index] = {
      ...uploadQueue.value[index],
      status: 'uploading',
      tusUploadId: tusId
    }

    // Start the chunked upload
    await chunkedUpload.start(tusId)

    // Wait for completion (watch handles status updates)
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        const tusUpload = chunkedUpload.getUpload(tusId)
        if (!tusUpload || tusUpload.status === 'completed' || tusUpload.status === 'error') {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  }

  /**
   * Upload a file using standard XHR
   */
  async function uploadStandardFile(item: UploadQueueItem) {
    const index = uploadQueue.value.findIndex(i => i.id === item.id)
    if (index === -1) return

    // Create abort controller
    const abortController = new AbortController()
    const itemId = item.id

    // Update status to uploading
    uploadQueue.value[index] = {
      ...uploadQueue.value[index],
      status: 'uploading',
      progress: 0,
      abortController
    }

    try {
      const formData = new FormData()
      formData.append('file', item.file)

      // Use XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            const idx = uploadQueue.value.findIndex(i => i.id === itemId)
            if (idx !== -1) {
              uploadQueue.value[idx] = {
                ...uploadQueue.value[idx],
                progress,
                bytesUploaded: e.loaded
              }
            }
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            try {
              const response = JSON.parse(xhr.responseText)
              reject(new Error(response.error?.message || 'Upload failed'))
            } catch {
              reject(new Error('Upload failed'))
            }
          }
        }

        xhr.onerror = () => reject(new Error('Network error'))
        xhr.onabort = () => reject(new Error('Upload cancelled'))

        // Handle abort signal
        abortController.signal.addEventListener('abort', () => {
          xhr.abort()
        })

        xhr.open('POST', uploadUrl)
        xhr.send(formData)
      })

      // Mark as completed
      const completedIdx = uploadQueue.value.findIndex(i => i.id === itemId)
      if (completedIdx !== -1) {
        uploadQueue.value[completedIdx] = {
          ...uploadQueue.value[completedIdx],
          status: 'completed',
          progress: 100
        }
      }

      // Notify completion
      onUploadComplete?.()
    } catch (err: unknown) {
      const errorIdx = uploadQueue.value.findIndex(i => i.id === itemId)
      if (errorIdx !== -1) {
        uploadQueue.value[errorIdx] = {
          ...uploadQueue.value[errorIdx],
          status: 'error',
          error: err instanceof Error ? err.message : 'Upload failed'
        }
      }
    }
  }

  /**
   * Pause a chunked upload
   */
  function pauseUpload(id: string) {
    const item = uploadQueue.value.find(i => i.id === id)
    if (!item || !item.isChunked || !item.tusUploadId) return

    chunkedUpload.pause(item.tusUploadId)
  }

  /**
   * Resume a paused chunked upload
   */
  function resumeUpload(id: string) {
    const item = uploadQueue.value.find(i => i.id === id)
    if (!item || !item.isChunked || !item.tusUploadId) return

    chunkedUpload.resume(item.tusUploadId)
  }

  /**
   * Cancel an upload
   */
  function cancelUpload(id: string) {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index === -1) return

    const item = uploadQueue.value[index]

    if (item.isChunked && item.tusUploadId) {
      // Cancel chunked upload
      chunkedUpload.cancel(item.tusUploadId)
    } else if (item.status === 'uploading' && item.abortController) {
      // Cancel standard upload
      item.abortController.abort()
    }

    // Remove from queue
    uploadQueue.value = uploadQueue.value.filter(i => i.id !== id)
  }

  /**
   * Retry a failed upload
   */
  function retryUpload(id: string) {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index === -1) return

    const item = uploadQueue.value[index]

    // Clean up old tus upload if exists
    if (item.tusUploadId) {
      chunkedUpload.remove(item.tusUploadId)
    }

    uploadQueue.value[index] = {
      ...uploadQueue.value[index],
      status: 'pending',
      progress: 0,
      bytesUploaded: 0,
      error: undefined,
      tusUploadId: undefined
    }

    // Start processing if not already
    if (!isProcessingQueue.value) {
      processQueue()
    }
  }

  /**
   * Remove item from queue
   */
  function removeFromQueue(id: string) {
    const item = uploadQueue.value.find(i => i.id === id)
    if (item?.tusUploadId) {
      chunkedUpload.remove(item.tusUploadId)
    }
    uploadQueue.value = uploadQueue.value.filter(item => item.id !== id)
  }

  /**
   * Clear completed and error items from queue
   */
  function clearCompleted() {
    // Clean up tus uploads for items being removed
    for (const item of uploadQueue.value) {
      if (
        (item.status === 'completed' || item.status === 'error') &&
        item.tusUploadId
      ) {
        chunkedUpload.remove(item.tusUploadId)
      }
    }

    uploadQueue.value = uploadQueue.value.filter(
      item => item.status === 'pending' || item.status === 'uploading' || item.status === 'paused'
    )
  }

  /**
   * Handle drag events
   */
  function handleDragEnter() {
    isDragging.value = true
  }

  function handleDragLeave() {
    isDragging.value = false
  }

  function handleDrop(e: DragEvent) {
    isDragging.value = false
    const files = Array.from(e.dataTransfer?.files || [])
    if (files.length > 0) {
      addFiles(files)
    }
  }

  return {
    // State
    uploadQueue,
    isProcessingQueue,
    isDragging,
    hasActiveUploads,
    completedCount,
    errorCount,

    // Resumable uploads (from localStorage, need user to re-select file)
    resumableUploads: chunkedUpload.resumableUploads,
    hasResumableUploads: chunkedUpload.hasResumableUploads,

    // Actions
    addFiles,
    cancelUpload,
    pauseUpload,
    resumeUpload,
    retryUpload,
    removeFromQueue,
    clearCompleted,
    dismissResumableUpload: chunkedUpload.dismissResumable,
    clearResumableUploads: chunkedUpload.clearResumable,

    // Drag handlers
    handleDragEnter,
    handleDragLeave,
    handleDrop,

    // Utilities
    formatFileSize
  }
}
