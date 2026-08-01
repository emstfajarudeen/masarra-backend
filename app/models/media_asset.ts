import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type MediaAssetDisk = 'local' | 's3'
export type MediaAssetVisibility = 'public' | 'private'

export default class MediaAsset extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare uploaderUserId: string | null

  @column()
  declare disk: MediaAssetDisk

  @column()
  declare visibility: MediaAssetVisibility

  @column()
  declare originalName: string

  @column()
  declare fileName: string

  @column()
  declare mimeType: string

  @column()
  declare extension: string

  @column()
  declare sizeBytes: number

  @column()
  declare path: string

  @column()
  declare url: string | null

  @column()
  declare metadata: Record<string, unknown>

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'uploaderUserId' })
  declare uploader: BelongsTo<typeof User>
}
