import vine from '@vinejs/vine'

export const roundQuestionParamsValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
      roundId: vine.string().uuid(),
    }),
  })
)

export const scoreRoundValidator = vine.compile(
  vine.object({
    params: vine.object({
      id: vine.string().uuid(),
      roundId: vine.string().uuid(),
    }),
    winnerTeamId: vine.string().uuid(),
    scoringRule: vine.enum(['normal', 'double', 'steal']).optional(),
    submittedAnswer: vine.string().trim().maxLength(4000).nullable().optional(),
    isCorrect: vine.boolean().optional(),
    metadata: vine.record(vine.any()).optional(),
  })
)
