import ContentPageTranslation from '#models/content_page_translation'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type ContentPageStatus = 'draft' | 'published'

export default class ContentPage extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare slug: string

  @column()
  declare status: ContentPageStatus

  @column()
  declare sortOrder: number

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => ContentPageTranslation)
  declare translations: HasMany<typeof ContentPageTranslation>

  @hasOne(() => ContentPageTranslation)
  declare translation: HasOne<typeof ContentPageTranslation>
}
