import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_session_round_answers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('game_session_round_id')
        .notNullable()
        .references('id')
        .inTable('game_session_rounds')
        .onDelete('CASCADE')
      table
        .uuid('team_id')
        .notNullable()
        .references('id')
        .inTable('game_session_teams')
        .onDelete('CASCADE')
      table.text('submitted_answer').nullable()
      table.boolean('is_correct').nullable()
      table.integer('points_awarded').notNullable().defaultTo(0)
      table.enum('scoring_rule', ['normal', 'double', 'steal']).notNullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['game_session_round_id'])
      table.index(['team_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
