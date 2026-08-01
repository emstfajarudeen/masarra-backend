import vine from '@vinejs/vine'

export const reserveGameSessionCreditsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)
