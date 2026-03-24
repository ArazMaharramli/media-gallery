/**
 * Token generation utility
 * Generates cryptographically secure 16-character alphanumeric tokens
 */
import { randomUUID } from 'crypto'

/**
 * Generate a 16-character URL-safe token for sharing links
 *
 * Uses UUID v4 as the source of randomness, which provides ~122 bits of entropy.
 * After removing hyphens and taking first 16 characters, we get ~64 bits of entropy,
 * which is sufficient for public shareable links.
 *
 * @returns 16-character alphanumeric string
 *
 * @example
 * const token = generateToken() // 'a1b2c3d4e5f6g7h8'
 */
export function generateToken(): string {
  return randomUUID().replace(/-/g, '').substring(0, 16)
}

/**
 * Validate a token format
 *
 * @param token - Token to validate
 * @returns True if token is valid format
 */
export function isValidToken(token: string): boolean {
  return /^[a-zA-Z0-9]{16}$/.test(token)
}
