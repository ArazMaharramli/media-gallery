/**
 * Checksum verification for tus uploads (ISSUE-004)
 * Verifies file integrity using SHA-256 checksums
 */
import { createHash } from 'crypto'
import { createReadStream } from 'fs'

/** Supported checksum algorithms */
const SUPPORTED_ALGORITHMS = ['sha256', 'sha1', 'md5'] as const
type ChecksumAlgorithm = (typeof SUPPORTED_ALGORITHMS)[number]

/** Parse the Upload-Checksum header */
export function parseChecksumHeader(
  header: string | undefined
): { algorithm: ChecksumAlgorithm; checksum: string } | null {
  if (!header) return null

  const parts = header.split(' ')
  if (parts.length !== 2) return null

  const [algorithm, checksum] = parts
  if (!SUPPORTED_ALGORITHMS.includes(algorithm as ChecksumAlgorithm)) {
    return null
  }

  return { algorithm: algorithm as ChecksumAlgorithm, checksum }
}

/** Calculate checksum of data buffer */
export function calculateChecksum(
  data: Buffer,
  algorithm: ChecksumAlgorithm
): string {
  const hash = createHash(algorithm)
  hash.update(data)
  return hash.digest('base64')
}

/**
 * Calculate checksum of a file using streams (memory efficient)
 * Returns base64-encoded checksum
 */
export function calculateFileChecksum(
  filePath: string,
  algorithm: ChecksumAlgorithm = 'sha256'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm)
    const stream = createReadStream(filePath)

    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('base64')))
    stream.on('error', reject)
  })
}

/**
 * Verify file checksum against expected value
 * Throws if checksum doesn't match
 */
export async function verifyFileChecksum(
  filePath: string,
  expectedChecksum: string,
  algorithm: ChecksumAlgorithm = 'sha256'
): Promise<void> {
  const actualChecksum = await calculateFileChecksum(filePath, algorithm)

  if (actualChecksum !== expectedChecksum) {
    throw new Error(
      `File checksum mismatch: expected ${expectedChecksum.slice(0, 16)}..., got ${actualChecksum.slice(0, 16)}...`
    )
  }

  console.debug(
    `File checksum verified: ${algorithm} ${expectedChecksum.slice(0, 8)}...`
  )
}
