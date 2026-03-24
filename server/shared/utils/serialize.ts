/**
 * Serialization utilities
 * Handle data transformation for JSON responses
 */

/**
 * Convert BigInt fields to numbers for JSON serialization
 *
 * PostgreSQL BIGINT columns are returned as JavaScript BigInt,
 * which cannot be directly serialized to JSON. This function
 * converts the `size` field from BigInt to number.
 *
 * @param media - Media object with potential BigInt size
 * @returns Media object with number size
 */
export function serializeMedia<T extends { size?: bigint | number | null }>(
  media: T
): Omit<T, 'size'> & { size: number | null } {
  if (!media) return media as any

  return {
    ...media,
    size: media.size !== null && media.size !== undefined
      ? Number(media.size)
      : null
  }
}

/**
 * Serialize an array of media objects
 */
export function serializeMediaArray<T extends { size?: bigint | number | null }>(
  items: T[]
): Array<Omit<T, 'size'> & { size: number | null }> {
  return items.map(serializeMedia)
}
