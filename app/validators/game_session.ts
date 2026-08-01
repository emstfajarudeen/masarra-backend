import vine from '@vinejs/vine'

export const createGameSessionValidator = vine.compile(
  vine.object({
    gameSlug: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(80)
      .regex(/^[a-z0-9-]+$/),
  })
)

export const gameSessionParamsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
  })
)

export const updateGameSessionTeamsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    teams: vine
      .array(
        vine.object({
          name: vine.string().trim().minLength(1).maxLength(80),
          color: vine
            .string()
            .trim()
            .regex(/^#[0-9A-Fa-f]{6}$/),
        })
      )
      .minLength(1)
      .maxLength(6),
  })
)

export const updateGameSessionSettingsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    roundCount: vine.number().withoutDecimals().positive(),
    questionDuration: vine.number().withoutDecimals().positive(),
  })
)

export const selectOptionalCategoryValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
    }),
    categorySlug: vine
      .string()
      .trim()
      .minLength(2)
      .maxLength(80)
      .regex(/^[a-z0-9-]+$/)
      .nullable(),
  })
)
