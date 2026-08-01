import Game from '#models/game'
import GameSessionRound from '#models/game_session_round'
import GameSessionTeam from '#models/game_session_team'
import Payment from '#models/payment'
import QuestionCategory from '#models/question_category'
import User from '#models/user'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type GameSessionStatus =
  'draft' | 'payment_pending' | 'ready' | 'active' | 'completed' | 'cancelled'
export type CreditReservationStatus = 'not_reserved' | 'reserved' | 'refunded' | 'forfeited'

export default class GameSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare hostUserId: string

  @column()
  declare gameId: string

  @column()
  declare optionalQuestionCategoryId: string | null

  @column()
  declare status: GameSessionStatus

  @column()
  declare selectedRoundCount: number | null

  @column()
  declare selectedQuestionDuration: number | null

  @column()
  declare categoryPaymentId: string | null

  @column()
  declare creditReservationStatus: CreditReservationStatus

  @column()
  declare reservedCreditCount: number

  @column()
  declare currentRoundNumber: number | null

  @column()
  declare completedRoundCount: number

  @column()
  declare refundedCreditCount: number

  @column.dateTime()
  declare creditsReservedAt: DateTime | null

  @column.dateTime()
  declare lockedAt: DateTime | null

  @column.dateTime()
  declare startedAt: DateTime | null

  @column.dateTime()
  declare endedAt: DateTime | null

  @column.dateTime()
  declare stoppedAt: DateTime | null

  @column()
  declare stopReason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'hostUserId' })
  declare host: BelongsTo<typeof User>

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => QuestionCategory, { foreignKey: 'optionalQuestionCategoryId' })
  declare optionalQuestionCategory: BelongsTo<typeof QuestionCategory>

  @belongsTo(() => Payment, { foreignKey: 'categoryPaymentId' })
  declare categoryPayment: BelongsTo<typeof Payment>

  @hasMany(() => GameSessionTeam, { foreignKey: 'gameSessionId' })
  declare teams: HasMany<typeof GameSessionTeam>

  @hasMany(() => GameSessionRound, { foreignKey: 'gameSessionId' })
  declare rounds: HasMany<typeof GameSessionRound>
}
