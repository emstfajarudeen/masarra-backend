import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'question_categories'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['game_id', 'status', 'is_enabled', 'sort_order'])
      table.dropColumn('is_enabled')
      table.index(['game_id', 'status', 'sort_order'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['game_id', 'status', 'sort_order'])
      table.boolean('is_enabled').notNullable().defaultTo(false)
      table.index(['game_id', 'status', 'is_enabled', 'sort_order'])
    })
  }
}
