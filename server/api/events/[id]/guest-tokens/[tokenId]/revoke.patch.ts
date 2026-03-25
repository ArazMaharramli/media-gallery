import { requireEvent } from '~/server/shared/middleware'
import { guestTokensRepository } from '~/server/features/tokens'
import { throwNotFoundError } from '~/server/utils/errors'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  await requireEvent(event)
  const tokenId = getRouterParam(event, 'tokenId')

  if (!tokenId) {
    throwNotFoundError('Guest token')
  }

  const success = await guestTokensRepository.revoke(tokenId)
  if (!success) {
    throwNotFoundError('Guest token', tokenId)
  }

  return successResponse(event, { revoked: true })
})
