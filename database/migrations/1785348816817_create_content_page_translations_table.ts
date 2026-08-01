import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'content_page_translations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('content_page_id')
        .notNullable()
        .references('id')
        .inTable('content_pages')
        .onDelete('CASCADE')
      table.string('locale', 5).notNullable()
      table.string('title', 180).notNullable()
      table.text('excerpt').nullable()
      table.text('body').notNullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['content_page_id', 'locale'])
      table.index(['locale'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
