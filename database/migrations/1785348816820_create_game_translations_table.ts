import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_translations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE')
      table.string('locale', 5).notNullable()
      table.string('title', 160).notNullable()
      table.text('description').nullable()
      table.text('instructions').nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['game_id', 'locale'])
      table.index(['locale'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
