import Question from '#models/question'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type QuestionTranslationLocale = 'ar' | 'en'

export default class QuestionTranslation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare questionId: string

  @column()
  declare locale: QuestionTranslationLocale

  @column()
  declare prompt: string

  @column({ serializeAs: null })
  declare correctAnswer: string | null

  @column()
  declare explanation: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Question, { foreignKey: 'questionId' })
  declare question: BelongsTo<typeof Question>
}
