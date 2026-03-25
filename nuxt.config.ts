// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Media Gallery',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Share your event photos and videos' }
      ]
    }
  },
  runtimeConfig: {
    // Server-only config (not exposed to client)
    upload: {
      maxChunkedSize: 10 * 1024 * 1024 * 1024, // 10GB - NUXT_UPLOAD_MAX_CHUNKED_SIZE
      staleThresholdHours: 24 // NUXT_UPLOAD_STALE_THRESHOLD_HOURS
    },
    cors: {
      origin: '' // NUXT_CORS_ORIGIN - empty string means allow same origin only
    },
    // Public config (exposed to client)
    public: {
      appUrl: '', // NUXT_PUBLIC_APP_URL - used for CORS validation
      upload: {
        chunkSize: 5 * 1024 * 1024, // 5MB - NUXT_PUBLIC_UPLOAD_CHUNK_SIZE
        chunkedThreshold: 50 * 1024 * 1024, // 50MB - NUXT_PUBLIC_UPLOAD_CHUNKED_THRESHOLD
        maxStandardSize: 500 * 1024 * 1024, // 500MB - NUXT_PUBLIC_UPLOAD_MAX_STANDARD_SIZE
        maxChunkedSize: 10 * 1024 * 1024 * 1024 // 10GB - NUXT_PUBLIC_UPLOAD_MAX_CHUNKED_SIZE
      }
    }
  },
  nitro: {
    // Enable experimental tasks for scheduled cleanup
    experimental: {
      tasks: true
    },
    // Schedule cleanup task to run every hour
    scheduledTasks: {
      '0 * * * *': ['cleanup-stale-uploads']
    }
  }
})
