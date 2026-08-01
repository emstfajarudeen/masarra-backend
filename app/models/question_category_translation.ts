import QuestionCategory from '#models/question_category'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type QuestionCategoryTranslationLocale = 'ar' | 'en'

export default class QuestionCategoryTranslation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare questionCategoryId: string

  @column()
  declare locale: QuestionCategoryTranslationLocale

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

  @belongsTo(() => QuestionCategory, { foreignKey: 'questionCategoryId' })
  declare category: BelongsTo<typeof QuestionCategory>
}
