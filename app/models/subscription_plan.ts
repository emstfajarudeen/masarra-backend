import SubscriptionPlanTranslation from '#models/subscription_plan_translation'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type SubscriptionPlanStatus = 'draft' | 'published' | 'archived'

export default class SubscriptionPlan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare slug: string

  @column()
  declare status: SubscriptionPlanStatus

  @column()
  declare priceAmount: string

  @column()
  declare priceCurrency: string

  @column()
  declare roundsGranted: number

  @column()
  declare maxTeams: number

  @column()
  declare isFeatured: boolean

  @column()
  declare badgeLabel: string | null

  @column()
  declare ctaLabel: string | null

  @column()
  declare note: string | null

  @column()
  declare advantages: string | null

  @column()
  declare sortOrder: number

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => SubscriptionPlanTranslation)
  declare translations: HasMany<typeof SubscriptionPlanTranslation>

  @hasOne(() => SubscriptionPlanTranslation)
  declare translation: HasOne<typeof SubscriptionPlanTranslation>
}
