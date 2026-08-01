import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_session_teams'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('game_session_id')
        .notNullable()
        .references('id')
        .inTable('game_sessions')
        .onDelete('CASCADE')
      table.string('name', 80).notNullable()
      table.string('normalized_name', 80).notNullable()
      table.string('color', 20).notNullable()
      table.integer('score').notNullable().defaultTo(0)
      table.integer('sort_order').unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['game_session_id', 'normalized_name'])
      table.unique(['game_session_id', 'color'])
      table.index(['game_session_id', 'sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
