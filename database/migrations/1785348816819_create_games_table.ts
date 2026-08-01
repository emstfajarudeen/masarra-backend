import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('slug', 80).notNullable().unique()
      table.enum('status', ['draft', 'published', 'archived']).notNullable().defaultTo('draft')
      table.integer('min_team_count').unsigned().notNullable()
      table.integer('max_team_count').unsigned().notNullable()
      table.jsonb('allowed_round_counts').notNullable().defaultTo('[]')
      table.jsonb('allowed_question_durations').notNullable().defaultTo('[]')
      table.integer('base_round_credit_cost').unsigned().notNullable().defaultTo(1)
      table.boolean('optional_categories_enabled').notNullable().defaultTo(false)
      table.integer('sort_order').unsigned().notNullable().defaultTo(0)
      table.timestamp('published_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['status', 'sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
