import Game from '#models/game'
import GameSession from '#models/game_session'
import Question from '#models/question'
import QuestionCategoryTranslation from '#models/question_category_translation'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type QuestionCategoryStatus = 'draft' | 'published' | 'archived'

export default class QuestionCategory extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare gameId: string

  @column()
  declare slug: string

  @column()
  declare status: QuestionCategoryStatus

  @column()
  declare priceAmount: string | null

  @column()
  declare priceCurrency: string

  @column()
  declare sortOrder: number

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @hasMany(() => QuestionCategoryTranslation)
  declare translations: HasMany<typeof QuestionCategoryTranslation>

  @hasOne(() => QuestionCategoryTranslation)
  declare translation: HasOne<typeof QuestionCategoryTranslation>

  @hasMany(() => GameSession, { foreignKey: 'optionalQuestionCategoryId' })
  declare sessions: HasMany<typeof GameSession>

  @hasMany(() => Question, { foreignKey: 'questionCategoryId' })
  declare questions: HasMany<typeof Question>
}
