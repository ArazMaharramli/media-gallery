/**
 * Media upload composable
 * Manages upload queue and file upload operations
 */
import { ref, computed } from 'vue'

export interface UploadQueueItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
  abortController?: AbortController
}

export function useMediaUpload(eventId: string, onUploadComplete?: () => void) {
  const uploadQueue = ref<UploadQueueItem[]>([])
  const isProcessingQueue = ref(false)
  const isDragging = ref(false)

  // Computed
  const hasActiveUploads = computed(() =>
    uploadQueue.value.some(item => item.status === 'uploading' || item.status === 'pending')
  )

  const completedCount = computed(() =>
    uploadQueue.value.filter(item => item.status === 'completed').length
  )

  const errorCount = computed(() =>
    uploadQueue.value.filter(item => item.status === 'error').length
  )

  /**
   * Add files to the upload queue
   */
  function addFiles(files: File[]) {
    const newItems: UploadQueueItem[] = files.map(file => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      file,
      status: 'pending',
      progress: 0
    }))

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

      await uploadFile(pendingItem)
    }

    isProcessingQueue.value = false
  }

  /**
   * Upload a single file
   */
  async function uploadFile(item: UploadQueueItem) {
    const index = uploadQueue.value.findIndex(i => i.id === item.id)
    if (index === -1) return

    // Create abort controller
    const abortController = new AbortController()
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
            const idx = uploadQueue.value.findIndex(i => i.id === item.id)
            if (idx !== -1) {
              uploadQueue.value[idx] = {
                ...uploadQueue.value[idx],
                progress
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

        xhr.open('POST', `/api/events/${eventId}/upload`)
        xhr.send(formData)
      })

      // Mark as completed
      const idx = uploadQueue.value.findIndex(i => i.id === item.id)
      if (idx !== -1) {
        uploadQueue.value[idx] = {
          ...uploadQueue.value[idx],
          status: 'completed',
          progress: 100
        }
      }

      // Notify completion
      onUploadComplete?.()

    } catch (err: any) {
      const idx = uploadQueue.value.findIndex(i => i.id === item.id)
      if (idx !== -1) {
        uploadQueue.value[idx] = {
          ...uploadQueue.value[idx],
          status: 'error',
          error: err.message || 'Upload failed'
        }
      }
    }
  }

  /**
   * Cancel an upload
   */
  function cancelUpload(id: string) {
    const index = uploadQueue.value.findIndex(item => item.id === id)
    if (index === -1) return

    const item = uploadQueue.value[index]

    if (item.status === 'uploading' && item.abortController) {
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

    uploadQueue.value[index] = {
      ...uploadQueue.value[index],
      status: 'pending',
      progress: 0,
      error: undefined
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
    uploadQueue.value = uploadQueue.value.filter(item => item.id !== id)
  }

  /**
   * Clear completed and error items from queue
   */
  function clearCompleted() {
    uploadQueue.value = uploadQueue.value.filter(
      item => item.status === 'pending' || item.status === 'uploading'
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

  /**
   * Format file size for display
   */
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return {
    // State
    uploadQueue,
    isProcessingQueue,
    isDragging,
    hasActiveUploads,
    completedCount,
    errorCount,

    // Actions
    addFiles,
    cancelUpload,
    retryUpload,
    removeFromQueue,
    clearCompleted,

    // Drag handlers
    handleDragEnter,
    handleDragLeave,
    handleDrop,

    // Utilities
    formatFileSize
  }
}
