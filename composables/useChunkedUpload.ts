/**
 * Chunked upload composable using tus protocol
 * Enables reliable large file uploads with pause/resume capability
 * Includes SHA-256 checksum verification for data integrity (ISSUE-004)
 */
import * as tus from 'tus-js-client'

export interface ChunkedUploadItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error'
  progress: number
  bytesUploaded: number
  error?: string
  uploadUrl?: string
}

/** Persisted upload info for localStorage (ISSUE-006) */
export interface PersistedUploadInfo {
  id: string
  filename: string
  fileSize: number
  metadata: Record<string, string>
  tusUrl?: string
  progress?: number
  bytesUploaded?: number
}

/** Resumable upload placeholder (shown before user re-selects file) */
export interface ResumableUploadItem {
  id: string
  filename: string
  fileSize: number
  progress: number
  bytesUploaded: number
  status: 'resumable'
}

const STORAGE_KEY = 'chunked-uploads-pending'

/**
 * Calculate SHA-256 checksum of entire file using Web Crypto API
 * Returns base64-encoded checksum
 */
async function calculateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = new Uint8Array(hashBuffer)
  let binary = ''
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i])
  }
  return btoa(binary)
}

/** Save pending uploads to localStorage */
function persistUploads(uploads: Map<string, ChunkedUploadItem>): void {
  if (typeof window === 'undefined') return

  const pending: PersistedUploadInfo[] = []
  for (const [id, item] of uploads) {
    if (item.status !== 'completed' && item.status !== 'error') {
      pending.push({
        id,
        filename: item.file.name,
        fileSize: item.file.size,
        metadata: {},
        tusUrl: item.uploadUrl,
        progress: item.progress,
        bytesUploaded: item.bytesUploaded
      })
    }
  }
  try {
    if (pending.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.debug('Could not persist uploads to localStorage:', error)
  }
}

/** Get pending uploads info from localStorage */
export function getPendingUploadsInfo(): PersistedUploadInfo[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/** Clear pending uploads from localStorage */
export function clearPendingUploads(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/** Remove a specific pending upload from localStorage */
function removePendingUpload(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const pending = getPendingUploadsInfo().filter((p) => p.id !== id)
    if (pending.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pending))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.debug('Could not update localStorage:', error)
  }
}

export function useChunkedUpload(endpoint: string = '/api/tus') {
  const config = useRuntimeConfig()
  const chunkSize = config.public.upload.chunkSize

  // Store uploads by ID
  const uploads = ref<Map<string, ChunkedUploadItem>>(new Map())
  // Store tus instances separately (not reactive to avoid proxy issues)
  const tusInstances = new Map<string, tus.Upload>()

  // Resumable uploads from localStorage (need user to re-select file)
  const resumableUploads = ref<ResumableUploadItem[]>([])

  // Load resumable uploads from localStorage on init
  if (typeof window !== 'undefined') {
    const pending = getPendingUploadsInfo()
    resumableUploads.value = pending.map((p) => ({
      id: p.id,
      filename: p.filename,
      fileSize: p.fileSize,
      progress: p.progress || 0,
      bytesUploaded: p.bytesUploaded || 0,
      status: 'resumable' as const
    }))
  }

  /**
   * Create a new chunked upload
   * @param file - The file to upload
   * @param metadata - Additional metadata (eventId or guestToken)
   * @returns The upload ID
   */
  async function createUpload(
    file: File,
    metadata: Record<string, string>
  ): Promise<string> {
    const id = `tus-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    // Check if this file matches a resumable upload and remove it
    const matchingResumable = resumableUploads.value.find(
      (r) => r.filename === file.name && r.fileSize === file.size
    )
    if (matchingResumable) {
      resumableUploads.value = resumableUploads.value.filter(
        (r) => r.id !== matchingResumable.id
      )
      removePendingUpload(matchingResumable.id)
    }

    // Calculate file checksum for final verification (ISSUE-004)
    let fileChecksum: string | undefined
    try {
      fileChecksum = await calculateFileChecksum(file)
    } catch (error) {
      console.debug('Could not calculate file checksum:', error)
    }

    // Create tus upload instance with checksum verification
    const upload = new tus.Upload(file, {
      endpoint,
      chunkSize,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      metadata: {
        filename: file.name,
        filetype: file.type,
        // Include file checksum for server-side verification
        ...(fileChecksum && { checksum: `sha256 ${fileChecksum}` }),
        ...metadata
      },

      onProgress: (bytesUploaded: number, bytesTotal: number) => {
        const item = uploads.value.get(id)
        if (item) {
          item.progress = Math.round((bytesUploaded / bytesTotal) * 100)
          item.bytesUploaded = bytesUploaded
          // Trigger reactivity
          uploads.value = new Map(uploads.value)
        }
      },

      onSuccess: () => {
        const item = uploads.value.get(id)
        if (item) {
          item.status = 'completed'
          item.progress = 100
          item.uploadUrl = upload.url ?? undefined
          uploads.value = new Map(uploads.value)
          // Persist to localStorage (remove completed)
          persistUploads(uploads.value)
        }
        // Clean up tus instance
        tusInstances.delete(id)
      },

      onError: (error: Error) => {
        const item = uploads.value.get(id)
        if (item) {
          item.status = 'error'
          item.error = error.message
          uploads.value = new Map(uploads.value)
          // Persist to localStorage (keep errored for retry info)
          persistUploads(uploads.value)
        }
      }
    })

    // Store tus instance
    tusInstances.set(id, upload)

    // Create reactive upload item
    uploads.value.set(id, {
      id,
      file,
      status: 'pending',
      progress: 0,
      bytesUploaded: 0
    })
    uploads.value = new Map(uploads.value)

    // Persist to localStorage
    persistUploads(uploads.value)

    return id
  }

  /**
   * Start or resume an upload
   */
  async function start(id: string): Promise<void> {
    const upload = tusInstances.get(id)
    const item = uploads.value.get(id)
    if (!upload || !item) return

    // Check for previous uploads (resume capability)
    try {
      const previousUploads = await upload.findPreviousUploads()
      if (previousUploads.length > 0) {
        // Resume from the most recent previous upload
        upload.resumeFromPreviousUpload(previousUploads[0])
        console.log('Resuming from previous upload')
      }
    } catch (error) {
      console.debug('Could not check for previous uploads (non-critical):', error)
    }

    item.status = 'uploading'
    uploads.value = new Map(uploads.value)
    upload.start()
  }

  /**
   * Pause an active upload
   */
  function pause(id: string): void {
    const upload = tusInstances.get(id)
    const item = uploads.value.get(id)
    if (!upload || !item) return

    if (item.status === 'uploading') {
      upload.abort()
      item.status = 'paused'
      item.uploadUrl = upload.url ?? undefined
      uploads.value = new Map(uploads.value)
      // Persist to localStorage (save pause state)
      persistUploads(uploads.value)
    }
  }

  /**
   * Resume a paused upload
   */
  function resume(id: string): void {
    const upload = tusInstances.get(id)
    const item = uploads.value.get(id)
    if (!upload || !item) return

    if (item.status === 'paused') {
      upload.start()
      item.status = 'uploading'
      uploads.value = new Map(uploads.value)
    }
  }

  /**
   * Cancel and remove an upload
   */
  function cancel(id: string): void {
    const upload = tusInstances.get(id)
    if (upload) {
      upload.abort()
      tusInstances.delete(id)
    }
    uploads.value.delete(id)
    uploads.value = new Map(uploads.value)
    // Persist to localStorage
    persistUploads(uploads.value)
  }

  /**
   * Remove a completed or errored upload from the list
   */
  function remove(id: string): void {
    tusInstances.delete(id)
    uploads.value.delete(id)
    uploads.value = new Map(uploads.value)
    // Persist to localStorage
    persistUploads(uploads.value)
  }

  /**
   * Dismiss a resumable upload (user doesn't want to resume)
   */
  function dismissResumable(id: string): void {
    resumableUploads.value = resumableUploads.value.filter((r) => r.id !== id)
    removePendingUpload(id)
  }

  /**
   * Clear all resumable uploads
   */
  function clearResumable(): void {
    resumableUploads.value = []
    clearPendingUploads()
  }

  /**
   * Get upload item by ID
   */
  function getUpload(id: string): ChunkedUploadItem | undefined {
    return uploads.value.get(id)
  }

  /**
   * Get all uploads as an array
   */
  const uploadList = computed(() => Array.from(uploads.value.values()))

  /**
   * Check if there are resumable uploads
   */
  const hasResumableUploads = computed(() => resumableUploads.value.length > 0)

  return {
    uploads: uploadList,
    resumableUploads: computed(() => resumableUploads.value),
    hasResumableUploads,
    createUpload,
    start,
    pause,
    resume,
    cancel,
    remove,
    dismissResumable,
    clearResumable,
    getUpload
  }
}
