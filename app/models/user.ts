import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import GameSession from '#models/game_session'
import CreditTransaction from '#models/credit_transaction'
import Payment from '#models/payment'
import UserVerificationCode from '#models/user_verification_code'

export type UserStatus = 'active' | 'suspended'
export type UserLocale = 'ar' | 'en'
export type UserRole = 'user' | 'admin'

export default class User extends compose(
  BaseModel,
  withAuthFinder(hash, {
    uids: ['email', 'phone_number'],
    passwordColumnName: 'password',
  })
) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string

  @column()
  declare phoneNumber: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare status: UserStatus

  @column()
  declare role: UserRole

  @column()
  declare preferredLocale: UserLocale

  @column.dateTime()
  declare emailVerifiedAt: DateTime | null

  @column.dateTime()
  declare phoneVerifiedAt: DateTime | null

  @column.dateTime()
  declare termsAcceptedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @hasMany(() => UserVerificationCode)
  declare verificationCodes: HasMany<typeof UserVerificationCode>

  @hasMany(() => GameSession, { foreignKey: 'hostUserId' })
  declare gameSessions: HasMany<typeof GameSession>

  @hasMany(() => Payment)
  declare payments: HasMany<typeof Payment>

  @hasMany(() => CreditTransaction)
  declare creditTransactions: HasMany<typeof CreditTransaction>

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  get initials() {
    const [first, last] = this.fullName.split(' ')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
