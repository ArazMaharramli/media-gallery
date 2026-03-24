/**
 * Local filesystem storage implementation
 * Stores files in the uploads/ directory
 */
import { randomUUID } from 'crypto'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, extname } from 'path'
import type { IStorageService, StorageFile, SaveOptions } from './storage.interface'

class LocalStorageService implements IStorageService {
  private uploadDir: string

  constructor() {
    this.uploadDir = this.resolveUploadDir()
  }

  /**
   * Resolve the upload directory based on environment
   * In production (.output), uploads are in parent directory
   */
  private resolveUploadDir(): string {
    const isProduction = process.cwd().includes('.output')
    if (isProduction) {
      return join(process.cwd(), '..', 'uploads')
    }
    return join(process.cwd(), 'uploads')
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

  getServeUrl(eventId: string, filename: string, variant?: string): string {
    const base = `/api/uploads/${eventId}/${filename}`
    return variant ? `${base}?variant=${variant}` : base
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService()
