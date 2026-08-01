import Game from '#models/game'
import QuestionCategory from '#models/question_category'
import QuestionTranslation from '#models/question_translation'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type QuestionStatus = 'draft' | 'published' | 'archived'
export type QuestionType = 'knowledge' | 'challenge'

export default class Question extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare gameId: string

  @column()
  declare questionCategoryId: string | null

  @column()
  declare status: QuestionStatus

  @column()
  declare type: QuestionType

  @column()
  declare basePoints: number

  @column()
  declare sortOrder: number

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => QuestionCategory, { foreignKey: 'questionCategoryId' })
  declare category: BelongsTo<typeof QuestionCategory>

  @hasMany(() => QuestionTranslation)
  declare translations: HasMany<typeof QuestionTranslation>

  @hasOne(() => QuestionTranslation)
  declare translation: HasOne<typeof QuestionTranslation>
}
