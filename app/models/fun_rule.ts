import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class FunRule extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare code: string

  @column()
  declare nameAr: string

  @column()
  declare nameEn: string | null

  @column()
  declare descriptionAr: string | null

  @column()
  declare descriptionEn: string | null

  @column()
  declare effectType: string

  @column()
  declare config: Record<string, unknown>

  @column()
  declare isActive: boolean

  @column()
  declare sortOrder: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
