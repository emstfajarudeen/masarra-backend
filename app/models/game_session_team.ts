import GameSession from '#models/game_session'
import GameSessionRoundAnswer from '#models/game_session_round_answer'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class GameSessionTeam extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare gameSessionId: string

  @column()
  declare name: string

  @column()
  declare normalizedName: string

  @column()
  declare color: string

  @column()
  declare score: number

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => GameSession, { foreignKey: 'gameSessionId' })
  declare session: BelongsTo<typeof GameSession>

  @hasMany(() => GameSessionRoundAnswer, { foreignKey: 'teamId' })
  declare answers: HasMany<typeof GameSessionRoundAnswer>
}
