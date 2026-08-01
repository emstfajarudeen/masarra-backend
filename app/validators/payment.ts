import vine from '@vinejs/vine'

export const createCategoryPaymentIntentValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    method: vine.enum(['direct', 'wallet']).optional(),
  })
)

export const confirmPaymentValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    providerReference: vine.string().trim().maxLength(180).optional(),
  })
)
