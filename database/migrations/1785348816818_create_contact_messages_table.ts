import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contact_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('full_name', 160).notNullable()
      table.string('email', 254).notNullable()
      table.text('message').notNullable()
      table.enum('status', ['new', 'reviewed', 'archived']).notNullable().defaultTo('new')
      table.string('ip_address', 64).nullable()
      table.string('user_agent', 512).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['email'])
      table.index(['status', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
