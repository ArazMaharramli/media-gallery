import { mediaService } from '~/server/features/media'
import { throwNotFoundError, throwValidationError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFoundError('Media')
  }

  try {
    await mediaService.retryProcessing(id)
    return successResponse(event, { message: 'Processing retry started' })
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') {
      throwNotFoundError('Media', id)
    }
    if (err.code === 'INVALID_TYPE' || err.code === 'INVALID_STATE') {
      throwValidationError(err.message)
    }
    throw err
  }
})
