import Game from '#models/game'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type GameTranslationLocale = 'ar' | 'en'

export default class GameTranslation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare gameId: string

  @column()
  declare locale: GameTranslationLocale

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare instructions: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>
}
