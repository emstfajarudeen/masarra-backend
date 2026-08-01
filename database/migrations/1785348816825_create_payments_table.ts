import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

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
      table.enum('payable_type', ['optional_category']).notNullable()
      table.enum('method', ['direct', 'wallet']).notNullable()
      table
        .enum('status', ['pending', 'paid', 'failed', 'expired', 'cancelled'])
        .notNullable()
        .defaultTo('pending')
      table.decimal('amount', 10, 3).notNullable()
      table.string('currency', 3).notNullable().defaultTo('KWD')
      table.string('provider', 80).nullable()
      table.string('provider_reference', 180).nullable()
      table.string('idempotency_key', 180).notNullable().unique()
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('expires_at').nullable()
      table.timestamp('paid_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id', 'status', 'created_at'])
      table.index(['game_session_id', 'payable_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
