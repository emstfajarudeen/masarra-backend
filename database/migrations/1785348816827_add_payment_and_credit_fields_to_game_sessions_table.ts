import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_sessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .uuid('category_payment_id')
        .nullable()
        .references('id')
        .inTable('payments')
        .onDelete('SET NULL')
      table
        .enum('credit_reservation_status', ['not_reserved', 'reserved', 'refunded', 'forfeited'])
        .notNullable()
        .defaultTo('not_reserved')
      table.integer('reserved_credit_count').unsigned().notNullable().defaultTo(0)
      table.timestamp('credits_reserved_at').nullable()

      table.index(['category_payment_id'])
      table.index(['credit_reservation_status'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['credit_reservation_status'])
      table.dropIndex(['category_payment_id'])
      table.dropColumn('credits_reserved_at')
      table.dropColumn('reserved_credit_count')
      table.dropColumn('credit_reservation_status')
      table.dropColumn('category_payment_id')
    })
  }
}
