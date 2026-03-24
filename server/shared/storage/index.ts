/**
 * Storage module exports
 */
export type {
  IStorageService,
  StorageFile,
  SaveOptions
} from './storage.interface'

export { localStorageService } from './local-storage.service'

// Default storage service (can be swapped for S3 in production)
import { localStorageService } from './local-storage.service'
export const storageService = localStorageService
