import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('host_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('RESTRICT')
      table
        .uuid('optional_question_category_id')
        .nullable()
        .references('id')
        .inTable('question_categories')
        .onDelete('SET NULL')
      table
        .enum('status', ['draft', 'payment_pending', 'ready', 'active', 'completed', 'cancelled'])
        .notNullable()
        .defaultTo('draft')
      table.integer('selected_round_count').unsigned().nullable()
      table.integer('selected_question_duration').unsigned().nullable()
      table.timestamp('locked_at').nullable()
      table.timestamp('started_at').nullable()
      table.timestamp('ended_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['host_user_id', 'status', 'created_at'])
      table.index(['game_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
