import vine from '@vinejs/vine'

export const gameplaySessionParamsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

export const completeRoundValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
      roundId: vine.string().uuid(),
    }),
    metadata: vine.record(vine.any()).optional(),
  })
)

export const abandonRoundValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
      roundId: vine.string().uuid(),
    }),
    reason: vine.enum(['user_cancelled', 'client_disconnected', 'system_failure']).optional(),
  })
)

export const stopGameSessionValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    reason: vine.string().trim().minLength(2).maxLength(120).optional(),
  })
)
