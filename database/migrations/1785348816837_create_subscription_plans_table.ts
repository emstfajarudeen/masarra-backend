import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscription_plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('slug', 80).notNullable().unique()
      table.enum('status', ['draft', 'published', 'archived']).notNullable().defaultTo('draft')
      table.decimal('price_amount', 10, 3).notNullable().defaultTo(0)
      table.string('price_currency', 3).notNullable().defaultTo('KWD')
      table.integer('rounds_granted').unsigned().notNullable().defaultTo(0)
      table.integer('max_teams').unsigned().notNullable().defaultTo(6)
      table.boolean('is_featured').notNullable().defaultTo(false)
      table.string('badge_label', 60).nullable()
      table.string('cta_label', 60).nullable()
      table.string('note', 280).nullable()
      table.jsonb('highlights').notNullable().defaultTo('[]')
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
