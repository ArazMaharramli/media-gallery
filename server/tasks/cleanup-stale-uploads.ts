/**
 * Cleanup task for stale tus uploads
 * Removes incomplete uploads older than configured threshold
 *
 * This task is scheduled to run hourly via nuxt.config.ts
 * Can also be run manually via Nitro's task system
 */
import { readdir, stat, rm } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { storageService } from '~/server/shared/storage'

export default defineTask({
  meta: {
    name: 'cleanup-stale-uploads',
    description: 'Remove stale/abandoned tus uploads older than configured threshold'
  },

  async run() {
    const config = useRuntimeConfig()
    const staleThresholdMs = config.upload.staleThresholdHours * 60 * 60 * 1000
    const tempDir = storageService.getTempDir()

    if (!existsSync(tempDir)) {
      return { result: 'No temp directory exists' }
    }

    try {
      const entries = await readdir(tempDir)
      let cleanedCount = 0
      let errorCount = 0

      for (const entry of entries) {
        const entryPath = join(tempDir, entry)

        try {
          const stats = await stat(entryPath)
          const age = Date.now() - stats.mtimeMs

          if (age > staleThresholdMs) {
            await rm(entryPath, { recursive: true, force: true })
            cleanedCount++
            console.log(`Cleaned up stale upload: ${entry} (age: ${Math.round(age / 3600000)}h)`)
          }
        } catch (err) {
          errorCount++
          console.error(`Failed to process ${entry}:`, err)
        }
      }

      return {
        result: `Cleaned ${cleanedCount} stale uploads, ${errorCount} errors`
      }
    } catch (err) {
      console.error('Cleanup task failed:', err)
      return { result: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` }
    }
  }
})
