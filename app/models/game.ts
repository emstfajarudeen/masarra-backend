import GameTranslation from '#models/game_translation'
import GameSession from '#models/game_session'
import Question from '#models/question'
import QuestionCategory from '#models/question_category'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type GameStatus = 'draft' | 'published' | 'archived'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare slug: string

  @column()
  declare status: GameStatus

  @column()
  declare minTeamCount: number

  @column()
  declare maxTeamCount: number

  @column()
  declare allowedRoundCounts: number[]

  @column()
  declare allowedQuestionDurations: number[]

  @column()
  declare baseRoundCreditCost: number

  @column()
  declare optionalCategoriesEnabled: boolean

  @column()
  declare sortOrder: number

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => GameTranslation)
  declare translations: HasMany<typeof GameTranslation>

  @hasOne(() => GameTranslation)
  declare translation: HasOne<typeof GameTranslation>

  @hasMany(() => QuestionCategory)
  declare categories: HasMany<typeof QuestionCategory>

  @hasMany(() => GameSession)
  declare sessions: HasMany<typeof GameSession>

  @hasMany(() => Question)
  declare questions: HasMany<typeof Question>
}
