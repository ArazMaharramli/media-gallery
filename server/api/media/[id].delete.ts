import { mediaService } from '~/server/features/media'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFoundError('Media')
  }

  try {
    await mediaService.deleteMedia(id)
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') {
      throwNotFoundError('Media', id)
    }
    throw err
  }

  return successResponse(event, { deleted: true })
})
