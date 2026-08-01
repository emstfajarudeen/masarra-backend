import GameSessionRound from '#models/game_session_round'
import GameSessionTeam from '#models/game_session_team'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type AnswerScoringRule = 'normal' | 'double' | 'steal'

export default class GameSessionRoundAnswer extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare gameSessionRoundId: string

  @column()
  declare teamId: string

  @column()
  declare submittedAnswer: string | null

  @column()
  declare isCorrect: boolean | null

  @column()
  declare pointsAwarded: number

  @column()
  declare scoringRule: AnswerScoringRule

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => GameSessionRound, { foreignKey: 'gameSessionRoundId' })
  declare round: BelongsTo<typeof GameSessionRound>

  @belongsTo(() => GameSessionTeam, { foreignKey: 'teamId' })
  declare team: BelongsTo<typeof GameSessionTeam>
}
