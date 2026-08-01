import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('first_name', 80).notNullable()
      table.string('last_name', 80).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('phone_number', 20).notNullable().unique()
      table.string('password').notNullable()
      table.enum('status', ['active', 'suspended']).notNullable().defaultTo('active')
      table.string('preferred_locale', 5).notNullable().defaultTo('ar')
      table.timestamp('email_verified_at').nullable()
      table.timestamp('phone_verified_at').nullable()
      table.timestamp('terms_accepted_at').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
