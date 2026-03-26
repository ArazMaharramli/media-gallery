/**
 * tus server configuration
 * Handles chunked/resumable uploads using the tus protocol
 */
import { Server, Upload } from '@tus/server'
import { FileStore } from '@tus/file-store'
import { randomUUID } from 'crypto'
import type { IncomingMessage, ServerResponse } from 'http'
import { readFile, writeFile, rm } from 'fs/promises'
import { join } from 'path'
import { storageService } from '~/server/shared/storage'
import { parseMetadata, validateUploadMetadata } from './tus.validation'
import { finalizeUpload } from './tus.service'
import type { ValidatedUploadContext } from './tus.types'

/**
 * Persist upload context to file (survives server restarts)
 * Uses .context.json sidecar file alongside tus upload files
 */
async function saveUploadContext(
  uploadId: string,
  context: ValidatedUploadContext
): Promise<void> {
  const tempDir = storageService.getTempDir()
  const contextPath = join(tempDir, `${uploadId}.context.json`)
  await writeFile(contextPath, JSON.stringify(context), 'utf-8')
}

/**
 * Load upload context from file
 */
async function loadUploadContext(
  uploadId: string
): Promise<ValidatedUploadContext | null> {
  const tempDir = storageService.getTempDir()
  const contextPath = join(tempDir, `${uploadId}.context.json`)
  try {
    const data = await readFile(contextPath, 'utf-8')
    return JSON.parse(data) as ValidatedUploadContext
  } catch {
    console.debug(`Context file not found for upload ${uploadId}`)
    return null
  }
}

/**
 * Delete upload context file
 */
async function deleteUploadContext(uploadId: string): Promise<void> {
  const tempDir = storageService.getTempDir()
  const contextPath = join(tempDir, `${uploadId}.context.json`)
  try {
    await rm(contextPath, { force: true })
  } catch (error) {
    console.debug('Failed to delete context file (non-critical):', error)
  }
}

/**
 * Create and configure the tus server instance
 * Uses lazy initialization to ensure storage directories exist
 */
let tusServerInstance: Server | null = null

export function getTusServer(): Server {
  if (tusServerInstance) {
    return tusServerInstance
  }

  const config = useRuntimeConfig()
  const maxUploadSize = config.upload.maxChunkedSize
  const tempDir = storageService.ensureTempDirSync()

  tusServerInstance = new Server({
    path: '/api/tus',
    datastore: new FileStore({
      directory: tempDir
    }),

    // Trust X-Forwarded-Proto and X-Forwarded-Host headers from reverse proxy
    // Required for correct HTTPS URLs when behind nginx/traefik
    respectForwardedHeaders: true,

    // Generate UUID for upload IDs (matching existing pattern)
    namingFunction: () => randomUUID(),

    // Maximum file size from config
    maxSize: maxUploadSize,

    // Validate metadata and authorization on upload creation
    onUploadCreate: async (
      _req: IncomingMessage,
      res: ServerResponse,
      upload: Upload
    ) => {
      const metadata = parseMetadata(upload.metadata)

      // Early validation of Upload-Length against max size (ISSUE-008)
      if (upload.size && upload.size > maxUploadSize) {
        throw new Error(
          `File too large. Maximum size is ${Math.round(maxUploadSize / 1024 / 1024 / 1024)}GB`
        )
      }

      // Validate and get authorized context
      const context = await validateUploadMetadata(metadata)

      // Persist context to file (survives server restarts - ISSUE-001)
      await saveUploadContext(upload.id, context)

      console.log(
        `tus upload created: ${upload.id} for ${context.type} (event: ${context.eventId})`
      )

      return res
    },

    // Handle upload completion
    onUploadFinish: async (
      _req: IncomingMessage,
      res: ServerResponse,
      upload: Upload
    ) => {
      // Load context from file (ISSUE-001)
      const context = await loadUploadContext(upload.id)
      if (!context) {
        console.error(`No context found for upload ${upload.id}`)
        throw new Error('Upload context not found')
      }

      // Only delete context after successful finalization (ISSUE-003)
      await finalizeUpload(
        upload.id,
        upload.size ?? 0,
        upload.metadata,
        context
      )

      // Clean up context file only after success
      await deleteUploadContext(upload.id)

      return res
    }
  })

  return tusServerInstance
}
