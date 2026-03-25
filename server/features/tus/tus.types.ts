/**
 * Types for tus upload handling
 */

export interface TusUploadMetadata {
  filename: string
  filetype: string
  eventId?: string
  guestToken?: string
  /** File checksum for integrity verification (format: "algorithm base64-checksum") */
  checksum?: string
}

export interface ValidatedUploadContext {
  type: 'photographer' | 'guest'
  eventId: string
  guestTokenId?: string
}

export interface TusUploadInfo {
  id: string
  size: number
  offset: number
  metadata: TusUploadMetadata
  context: ValidatedUploadContext
}
