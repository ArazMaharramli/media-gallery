/**
 * Media upload composable
 * Manages upload queue and file upload operations
 */
import { ref, computed } from 'vue'
import { formatFileSize } from '~/utils/formatters'

export interface UploadQueueItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
  abortController?: AbortController
}

export function useMediaUpload(uploadUrl: string, onUploadComplete?: () => void) {
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
    const itemId = item.id

    // Update status to uploading
    const currentIndex = uploadQueue.value.findIndex(i => i.id === itemId)
    if (currentIndex === -1) return

    uploadQueue.value[currentIndex] = {
      ...uploadQueue.value[currentIndex],
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
              uploadQueue.value[idx].progress = progress
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

    } catch (err: any) {
      const errorIdx = uploadQueue.value.findIndex(i => i.id === itemId)
      if (errorIdx !== -1) {
        uploadQueue.value[errorIdx] = {
          ...uploadQueue.value[errorIdx],
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
