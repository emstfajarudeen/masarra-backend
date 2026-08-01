import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'game_session_rounds'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .uuid('question_id')
        .nullable()
        .references('id')
        .inTable('questions')
        .onDelete('SET NULL')
      table
        .uuid('winner_team_id')
        .nullable()
        .references('id')
        .inTable('game_session_teams')
        .onDelete('SET NULL')
      table.enum('scoring_rule', ['normal', 'double', 'steal']).nullable()
      table.integer('awarded_points').notNullable().defaultTo(0)

      table.index(['question_id'])
      table.index(['winner_team_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['winner_team_id'])
      table.dropIndex(['question_id'])
      table.dropColumn('awarded_points')
      table.dropColumn('scoring_rule')
      table.dropColumn('winner_team_id')
      table.dropColumn('question_id')
    })
  }
}
