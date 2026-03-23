import type { NitroApp } from 'nitropack'

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook('error', async (error, { event }) => {
    // Log the error for debugging (main error handling is in server/error.ts)
    console.error('[Nitro Error Hook]', {
      url: event?.path,
      method: event?.method,
      message: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
  })

  nitroApp.hooks.hook('afterResponse', async (event) => {
    // Log request duration in development
    if (process.env.NODE_ENV !== 'production' && event.context.requestStartTime) {
      const duration = Date.now() - event.context.requestStartTime
      console.log(`[API] ${event.method} ${event.path} - ${duration}ms`)
    }
  })
})
