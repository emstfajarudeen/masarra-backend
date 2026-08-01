import GameSession from '#models/game_session'
import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type PaymentPayableType = 'optional_category'
export type PaymentMethod = 'direct' | 'wallet'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare gameSessionId: string | null

  @column()
  declare payableType: PaymentPayableType

  @column()
  declare method: PaymentMethod

  @column()
  declare status: PaymentStatus

  @column()
  declare amount: string

  @column()
  declare currency: string

  @column()
  declare provider: string | null

  @column()
  declare providerReference: string | null

  @column()
  declare idempotencyKey: string

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare paidAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => GameSession)
  declare gameSession: BelongsTo<typeof GameSession>
}
