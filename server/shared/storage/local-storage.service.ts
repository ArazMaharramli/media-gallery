/**
 * Local filesystem storage implementation
 * Stores files in the uploads/ directory
 */
import { randomUUID } from 'crypto'
import { writeFile, unlink, mkdir, rename } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { join, extname } from 'path'
import type { IStorageService, StorageFile, SaveOptions } from './storage.interface'

class LocalStorageService implements IStorageService {
  private uploadDir: string

  constructor() {
    this.uploadDir = this.resolveUploadDir()
  }

  /**
   * Resolve the upload directory from runtime config
   * Set NUXT_UPLOAD_DIR environment variable to override
   */
  private resolveUploadDir(): string {
    const config = useRuntimeConfig()
    const configuredDir = config.upload?.dir || './uploads'

    // If absolute path, use as-is; otherwise resolve relative to cwd
    if (configuredDir.startsWith('/')) {
      return configuredDir
    }
    return join(process.cwd(), configuredDir)
  }

  getUploadDir(): string {
    return this.uploadDir
  }

  getEventDir(eventId: string): string {
    return join(this.uploadDir, eventId)
  }

  async ensureEventDir(eventId: string): Promise<string> {
    const eventDir = this.getEventDir(eventId)
    if (!existsSync(eventDir)) {
      await mkdir(eventDir, { recursive: true })
    }
    return eventDir
  }

  async save(
    eventId: string,
    buffer: Buffer,
    originalName: string,
    options?: SaveOptions
  ): Promise<StorageFile> {
    // Ensure directory exists
    const eventDir = await this.ensureEventDir(eventId)

    // Generate filename
    const ext = extname(originalName) || '.bin'
    const filename = options?.filename || `${randomUUID()}${ext}`
    const storageKey = `${eventId}/${filename}`

    // Write file
    const filePath = join(eventDir, filename)
    await writeFile(filePath, buffer)

    return { filename, storageKey }
  }

  async delete(eventId: string, filename: string): Promise<boolean> {
    const filePath = this.getFilePath(eventId, filename)

    if (!existsSync(filePath)) {
      return false
    }

    await unlink(filePath)
    return true
  }

  async deleteVariants(eventId: string, baseFilename: string): Promise<void> {
    const baseName = baseFilename.replace(/\.[^/.]+$/, '')
    const eventDir = this.getEventDir(eventId)

    // Common variant suffixes
    const variantSuffixes = [
      '_thumb.webp',
      '_thumb.jpg',
      '_preview.webp',
      '_preview.jpg',
      '_preview.mp4',
      '_preview.webm'
    ]

    // Delete each variant if it exists
    for (const suffix of variantSuffixes) {
      const variantPath = join(eventDir, `${baseName}${suffix}`)
      if (existsSync(variantPath)) {
        try {
          await unlink(variantPath)
        } catch {
          // Ignore errors for individual variant deletion
        }
      }
    }
  }

  exists(eventId: string, filename: string): boolean {
    return existsSync(this.getFilePath(eventId, filename))
  }

  getFilePath(eventId: string, filename: string): string {
    return join(this.uploadDir, eventId, filename)
  }

  getFileUrl(eventId: string, filename: string): string {
    return `/api/uploads/${eventId}/${filename}`
  }

  /**
   * Get the temp directory path for tus uploads
   */
  getTempDir(): string {
    return join(this.uploadDir, 'temp')
  }

  /**
   * Ensure the temp directory exists (async)
   */
  async ensureTempDir(): Promise<string> {
    const tempDir = this.getTempDir()
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true })
    }
    return tempDir
  }

  /**
   * Ensure the temp directory exists (sync, for tus server initialization)
   */
  ensureTempDirSync(): string {
    const tempDir = this.getTempDir()
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true })
    }
    return tempDir
  }

  /**
   * Move a file from a source path to an event directory
   * More efficient than save() for large files as it avoids copying
   * @param eventId - The event ID
   * @param sourcePath - Full path to the source file
   * @param originalName - Original filename (used for extension)
   * @param options - Optional save options
   * @returns Storage file info
   */
  async moveToEvent(
    eventId: string,
    sourcePath: string,
    originalName: string,
    options?: SaveOptions
  ): Promise<StorageFile> {
    // Ensure event directory exists
    const eventDir = await this.ensureEventDir(eventId)

    // Generate filename
    const ext = extname(originalName) || '.bin'
    const filename = options?.filename || `${randomUUID()}${ext}`
    const storageKey = `${eventId}/${filename}`
    const destPath = join(eventDir, filename)

    // Move file (rename is atomic on same filesystem)
    await rename(sourcePath, destPath)

    return { filename, storageKey }
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService()
