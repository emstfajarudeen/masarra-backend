import GameSession from '#models/game_session'
import GameSessionRoundAnswer from '#models/game_session_round_answer'
import GameSessionTeam from '#models/game_session_team'
import Question from '#models/question'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type GameSessionRoundStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'abandoned'
export type RoundCreditOutcome = 'reserved' | 'charged' | 'refunded' | 'forfeited'
export type RoundScoringRule = 'normal' | 'double' | 'steal'

export default class GameSessionRound extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare gameSessionId: string

  @column()
  declare roundNumber: number

  @column()
  declare status: GameSessionRoundStatus

  @column()
  declare creditOutcome: RoundCreditOutcome

  @column()
  declare questionId: string | null

  @column()
  declare winnerTeamId: string | null

  @column()
  declare scoringRule: RoundScoringRule | null

  @column()
  declare awardedPoints: number

  @column.dateTime()
  declare startedAt: DateTime | null

  @column.dateTime()
  declare completedAt: DateTime | null

  @column.dateTime()
  declare cancelledAt: DateTime | null

  @column.dateTime()
  declare abandonedAt: DateTime | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => GameSession, { foreignKey: 'gameSessionId' })
  declare session: BelongsTo<typeof GameSession>

  @belongsTo(() => Question)
  declare question: BelongsTo<typeof Question>

  @belongsTo(() => GameSessionTeam, { foreignKey: 'winnerTeamId' })
  declare winnerTeam: BelongsTo<typeof GameSessionTeam>

  @hasMany(() => GameSessionRoundAnswer, { foreignKey: 'gameSessionRoundId' })
  declare answers: HasMany<typeof GameSessionRoundAnswer>
}
