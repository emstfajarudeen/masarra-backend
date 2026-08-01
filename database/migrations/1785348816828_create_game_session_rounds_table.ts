import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_session_rounds'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('game_session_id')
        .notNullable()
        .references('id')
        .inTable('game_sessions')
        .onDelete('CASCADE')
      table.integer('round_number').unsigned().notNullable()
      table
        .enum('status', ['pending', 'active', 'completed', 'cancelled', 'abandoned'])
        .notNullable()
        .defaultTo('pending')
      table
        .enum('credit_outcome', ['reserved', 'charged', 'refunded', 'forfeited'])
        .notNullable()
        .defaultTo('reserved')
      table.timestamp('started_at').nullable()
      table.timestamp('completed_at').nullable()
      table.timestamp('cancelled_at').nullable()
      table.timestamp('abandoned_at').nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['game_session_id', 'round_number'])
      table.index(['game_session_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
