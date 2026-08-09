import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fun_rules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('code', 80).notNullable().unique()
      table.string('name_ar', 120).notNullable()
      table.string('name_en', 120).nullable()
      table.string('description_ar', 255).nullable()
      table.string('description_en', 255).nullable()
      table.string('effect_type', 50).notNullable().defaultTo('normal')
      table.jsonb('config').notNullable().defaultTo('{}')
      table.boolean('is_active').notNullable().defaultTo(true)
      table.integer('sort_order').unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['is_active', 'sort_order'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
