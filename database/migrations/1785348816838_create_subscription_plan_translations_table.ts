import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscription_plan_translations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('subscription_plan_id')
        .notNullable()
        .references('id')
        .inTable('subscription_plans')
        .onDelete('CASCADE')
      table.string('locale', 5).notNullable()
      table.string('title', 160).notNullable()
      table.text('description').nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['subscription_plan_id', 'locale'])
      table.index(['locale'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
