import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type VerificationPurpose = 'phone_verification'
export type VerificationChannel = 'sms'

export default class UserVerificationCode extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare purpose: VerificationPurpose

  @column()
  declare channel: VerificationChannel

  @column()
  declare destination: string

  @column({ serializeAs: null })
  declare codeHash: string

  @column()
  declare attempts: number

  @column.dateTime()
  declare expiresAt: DateTime

  @column.dateTime()
  declare consumedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  get isExpired() {
    return this.expiresAt <= DateTime.utc()
  }

  get isConsumed() {
    return this.consumedAt !== null
  }
}
