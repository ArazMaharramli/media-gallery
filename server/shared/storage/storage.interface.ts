/**
 * Storage service interface
 * Provides abstraction for file storage operations
 * Can be implemented with local filesystem or cloud storage (S3/MinIO)
 */

export interface StorageFile {
  filename: string
  storageKey: string
}

export interface SaveOptions {
  filename?: string // Optional custom filename, otherwise generated
}

export interface IStorageService {
  /**
   * Get the base upload directory path
   */
  getUploadDir(): string

  /**
   * Get the directory path for a specific event
   */
  getEventDir(eventId: string): string

  /**
   * Ensure the event directory exists
   */
  ensureEventDir(eventId: string): Promise<string>

  /**
   * Save a file to storage
   * @param eventId - The event ID
   * @param buffer - File content
   * @param originalName - Original filename (used for extension)
   * @param options - Optional save options
   * @returns Storage file info
   */
  save(
    eventId: string,
    buffer: Buffer,
    originalName: string,
    options?: SaveOptions
  ): Promise<StorageFile>

  /**
   * Delete a file from storage
   * @param eventId - The event ID
   * @param filename - The filename to delete
   * @returns True if deleted, false if file didn't exist
   */
  delete(eventId: string, filename: string): Promise<boolean>

  /**
   * Delete all variant files for a media item
   * @param eventId - The event ID
   * @param baseFilename - The base filename (e.g., uuid.jpg)
   */
  deleteVariants(eventId: string, baseFilename: string): Promise<void>

  /**
   * Check if a file exists
   */
  exists(eventId: string, filename: string): boolean

  /**
   * Get the full path to a file
   */
  getFilePath(eventId: string, filename: string): string

  /**
   * Get the public URL for a stored file.
   * When switching to S3/MinIO/CDN, only this method needs to change.
   */
  getFileUrl(eventId: string, filename: string): string

  /**
   * Get the temp directory path for tus uploads
   */
  getTempDir(): string

  /**
   * Ensure the temp directory exists (async)
   */
  ensureTempDir(): Promise<string>

  /**
   * Ensure the temp directory exists (sync)
   */
  ensureTempDirSync(): string

  /**
   * Move a file from a source path to an event directory
   * More efficient than save() for large files as it avoids copying
   * @param eventId - The event ID
   * @param sourcePath - Full path to the source file
   * @param originalName - Original filename (used for extension)
   * @param options - Optional save options
   * @returns Storage file info
   */
  moveToEvent(
    eventId: string,
    sourcePath: string,
    originalName: string,
    options?: SaveOptions
  ): Promise<StorageFile>
}
