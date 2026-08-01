import GameSession from '#models/game_session'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type CreditTransactionType = 'grant' | 'reservation' | 'refund' | 'forfeit' | 'adjustment'

export default class CreditTransaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare gameSessionId: string | null

  @column()
  declare type: CreditTransactionType

  @column()
  declare amount: number

  @column()
  declare currency: string

  @column()
  declare idempotencyKey: string

  @column()
  declare description: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => GameSession)
  declare gameSession: BelongsTo<typeof GameSession>
}
