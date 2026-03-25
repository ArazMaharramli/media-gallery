/**
 * Upload strategy composable
 * Determines whether to use chunked (tus) or standard uploads based on file size
 */

export function useUploadStrategy() {
  const config = useRuntimeConfig()

  // Get config values with defaults
  const CHUNKED_UPLOAD_THRESHOLD = config.public.upload.chunkedThreshold
  const MAX_STANDARD_UPLOAD_SIZE = config.public.upload.maxStandardSize
  const MAX_CHUNKED_UPLOAD_SIZE = config.public.upload.maxChunkedSize

  /**
   * Determine if a file should use chunked upload
   * @param file - The file to check
   * @returns true if the file should use chunked upload
   */
  function shouldUseChunkedUpload(file: File): boolean {
    return file.size >= CHUNKED_UPLOAD_THRESHOLD
  }

  /**
   * Get the maximum allowed file size based on upload strategy
   * @param isChunked - Whether chunked upload will be used
   * @returns Maximum file size in bytes
   */
  function getMaxFileSize(isChunked: boolean): number {
    return isChunked ? MAX_CHUNKED_UPLOAD_SIZE : MAX_STANDARD_UPLOAD_SIZE
  }

  /**
   * Check if a file size is valid for upload
   * @param file - The file to check
   * @returns true if the file size is valid
   */
  function isFileSizeValid(file: File): boolean {
    const maxSize = getMaxFileSize(shouldUseChunkedUpload(file))
    return file.size <= maxSize
  }

  /**
   * Categorize files into chunked and standard upload groups
   * @param files - Array of files to categorize
   * @returns Object with chunked and standard file arrays
   */
  function categorizeFiles(files: File[]): { chunked: File[]; standard: File[] } {
    const chunked: File[] = []
    const standard: File[] = []

    for (const file of files) {
      if (shouldUseChunkedUpload(file)) {
        chunked.push(file)
      } else {
        standard.push(file)
      }
    }

    return { chunked, standard }
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
  function formatMaxSize(isChunked: boolean): string {
    return formatFileSize(getMaxFileSize(isChunked))
  }

  return {
    shouldUseChunkedUpload,
    getMaxFileSize,
    isFileSizeValid,
    categorizeFiles,
    formatFileSize,
    formatMaxSize,
    CHUNKED_UPLOAD_THRESHOLD,
    MAX_STANDARD_UPLOAD_SIZE,
    MAX_CHUNKED_UPLOAD_SIZE
  }
}
