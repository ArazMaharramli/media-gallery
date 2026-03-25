/**
 * tus upload finalization service
 * Integrates completed tus uploads with the existing media processing pipeline
 */
import { rm } from 'fs/promises'
import { join } from 'path'
import { mediaService } from '~/server/features/media'
import { storageService } from '~/server/shared/storage'
import { parseMetadata } from './tus.validation'
import { parseChecksumHeader, verifyFileChecksum } from './tus.checksum'
import type { ValidatedUploadContext } from './tus.types'

/**
 * Finalize a completed tus upload
 * Verifies checksum (if provided) and moves file to final location
 */
export async function finalizeUpload(
  uploadId: string,
  uploadSize: number,
  rawMetadata: string | Record<string, string | null> | undefined,
  context: ValidatedUploadContext
): Promise<void> {
  const metadata = parseMetadata(rawMetadata)
  const tempDir = storageService.getTempDir()
  const tempFilePath = join(tempDir, uploadId)

  try {
    // Verify file checksum if provided (ISSUE-004)
    if (metadata.checksum) {
      const parsed = parseChecksumHeader(metadata.checksum)
      if (parsed) {
        await verifyFileChecksum(tempFilePath, parsed.checksum, parsed.algorithm)
        console.log(`Checksum verified for upload ${uploadId}`)
      }
    }

    // Use the new uploadMediaFromFile method for efficient large file handling
    await mediaService.uploadMediaFromFile({
      eventId: context.eventId,
      filePath: tempFilePath,
      mimeType: metadata.filetype,
      originalName: metadata.filename,
      size: uploadSize,
      guestTokenId: context.guestTokenId ?? null,
      uploadedBy: context.type
    })

    console.log(`tus upload finalized: ${uploadId} -> event ${context.eventId}`)
  } finally {
    // Clean up temp file (tus server keeps files after completion)
    try {
      await rm(tempFilePath, { force: true })
      // Also remove the .json info file that tus creates
      await rm(`${tempFilePath}.json`, { force: true })
    } catch (error) {
      console.debug('Temp file cleanup failed (non-critical):', error)
    }
  }
}
