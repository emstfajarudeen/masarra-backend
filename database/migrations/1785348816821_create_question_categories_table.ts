import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'question_categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE')
      table.string('slug', 80).notNullable()
      table.enum('status', ['draft', 'published', 'archived']).notNullable().defaultTo('draft')
      table.boolean('is_enabled').notNullable().defaultTo(false)
      table.decimal('price_amount', 10, 3).nullable()
      table.string('price_currency', 3).notNullable().defaultTo('KWD')
      table.integer('sort_order').unsigned().notNullable().defaultTo(0)
      table.timestamp('published_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['game_id', 'slug'])
      table.index(['game_id', 'status', 'is_enabled', 'sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
