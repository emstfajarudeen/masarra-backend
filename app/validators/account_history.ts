import vine from '@vinejs/vine'

export const accountHistoryListValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().positive().optional(),
    limit: vine.number().withoutDecimals().range([1, 100]).optional(),
    status: vine.string().trim().maxLength(40).optional(),
  })
)

export const accountHistorySessionParamsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

export const accountCreditTransactionListValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().positive().optional(),
    limit: vine.number().withoutDecimals().range([1, 100]).optional(),
    type: vine.enum(['grant', 'reservation', 'refund', 'forfeit', 'adjustment']).optional(),
  })
)

export const accountPaymentHistoryListValidator = vine.compile(
  vine.object({
    page: vine.number().withoutDecimals().positive().optional(),
    limit: vine.number().withoutDecimals().range([1, 100]).optional(),
    status: vine.enum(['pending', 'paid', 'failed', 'expired', 'cancelled']).optional(),
  })
)
