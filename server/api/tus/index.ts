/**
 * tus protocol root endpoint
 * Handles POST /api/tus (create new upload) and OPTIONS (CORS preflight)
 */
import { getTusServer } from '~/server/features/tus'
import { setTusCorsHeaders } from '~/server/utils/cors'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  // Set CORS headers for all tus requests (ISSUE-002: configurable origin)
  setTusCorsHeaders(event)

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setResponseStatus(event, 204)
    return ''
  }

  // Delegate to tus server
  const tusServer = getTusServer()

  try {
    await tusServer.handle(event.node.req, event.node.res)
  } catch (error) {
    console.error('tus server error:', error)
    if (!event.node.res.headersSent) {
      setResponseStatus(event, 500)
      return { error: 'Upload failed' }
    }
  }
})
