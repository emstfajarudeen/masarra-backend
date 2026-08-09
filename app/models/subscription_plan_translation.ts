import SubscriptionPlan from '#models/subscription_plan'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type SubscriptionPlanTranslationLocale = 'ar' | 'en'

export default class SubscriptionPlanTranslation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare subscriptionPlanId: string

  @column()
  declare locale: SubscriptionPlanTranslationLocale

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => SubscriptionPlan)
  declare plan: BelongsTo<typeof SubscriptionPlan>
}
