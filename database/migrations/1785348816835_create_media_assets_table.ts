import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'media_assets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('uploader_user_id')
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.enum('disk', ['local', 's3']).notNullable().defaultTo('local')
      table.enum('visibility', ['public', 'private']).notNullable().defaultTo('public')
      table.string('original_name', 255).notNullable()
      table.string('file_name', 160).notNullable()
      table.string('mime_type', 120).notNullable()
      table.string('extension', 20).notNullable()
      table.bigInteger('size_bytes').unsigned().notNullable()
      table.string('path', 500).notNullable()
      table.string('url', 1000).nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('deleted_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['disk', 'path'])
      table.index(['visibility', 'created_at'])
      table.index(['uploader_user_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
