import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_sessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('current_round_number').unsigned().nullable()
      table.integer('completed_round_count').unsigned().notNullable().defaultTo(0)
      table.integer('refunded_credit_count').unsigned().notNullable().defaultTo(0)
      table.timestamp('stopped_at').nullable()
      table.string('stop_reason', 120).nullable()

      table.index(['current_round_number'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['current_round_number'])
      table.dropColumn('stop_reason')
      table.dropColumn('stopped_at')
      table.dropColumn('refunded_credit_count')
      table.dropColumn('completed_round_count')
      table.dropColumn('current_round_number')
    })
  }
}
