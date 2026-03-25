import { mediaRepository } from '~/server/features/media'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFoundError('Media')
  }

  const media = await mediaRepository.findById(id)
  if (!media) {
    throwNotFoundError('Media', id)
  }

  await mediaRepository.update(id, { approvalStatus: 'rejected' })

  return successResponse(event, { message: 'Media rejected' })
})
