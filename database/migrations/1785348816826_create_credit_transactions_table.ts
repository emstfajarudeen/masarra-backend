import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'credit_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table
        .uuid('game_session_id')
        .nullable()
        .references('id')
        .inTable('game_sessions')
        .onDelete('SET NULL')
      table.enum('type', ['grant', 'reservation', 'refund', 'forfeit', 'adjustment']).notNullable()
      table.integer('amount').notNullable()
      table.string('currency', 20).notNullable().defaultTo('round_credit')
      table.string('idempotency_key', 180).notNullable().unique()
      table.text('description').nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id', 'created_at'])
      table.index(['game_session_id', 'type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
