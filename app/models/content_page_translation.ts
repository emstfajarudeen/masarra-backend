import ContentPage from '#models/content_page'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type ContentLocale = 'ar' | 'en'

export default class ContentPageTranslation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare contentPageId: string

  @column()
  declare locale: ContentLocale

  @column()
  declare title: string

  @column()
  declare excerpt: string | null

  @column()
  declare body: string

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => ContentPage)
  declare page: BelongsTo<typeof ContentPage>
}
