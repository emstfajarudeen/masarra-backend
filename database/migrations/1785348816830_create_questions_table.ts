import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'questions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE')
      table
        .uuid('question_category_id')
        .nullable()
        .references('id')
        .inTable('question_categories')
        .onDelete('SET NULL')
      table.enum('status', ['draft', 'published', 'archived']).notNullable().defaultTo('draft')
      table.enum('type', ['knowledge', 'challenge']).notNullable().defaultTo('knowledge')
      table.integer('base_points').unsigned().notNullable().defaultTo(5)
      table.integer('sort_order').unsigned().notNullable().defaultTo(0)
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('published_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['game_id', 'status', 'sort_order'])
      table.index(['question_category_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
