/**
 * Upload strategy composable
 * Handles file size validation for chunked uploads
 */

export function useUploadStrategy() {
  const config = useRuntimeConfig()

  // All uploads use chunked protocol - single max size
  const MAX_UPLOAD_SIZE = config.public.upload.maxChunkedSize

  /**
   * Check if a file size is valid for upload
   * @param file - The file to check
   * @returns true if the file size is valid
   */
  function isFileSizeValid(file: File): boolean {
    return file.size <= MAX_UPLOAD_SIZE
  }

  /**
   * Format file size for display
   * @param bytes - File size in bytes
   * @returns Formatted string (e.g., "5.2 MB")
   */
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  /**
   * Format max file size for display in error messages
   */
  function formatMaxSize(): string {
    return formatFileSize(MAX_UPLOAD_SIZE)
  }

  return {
    isFileSizeValid,
    formatFileSize,
    formatMaxSize,
    MAX_UPLOAD_SIZE
  }
}
