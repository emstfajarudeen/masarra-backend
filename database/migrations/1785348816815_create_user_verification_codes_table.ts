import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_verification_codes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.enum('purpose', ['phone_verification']).notNullable()
      table.enum('channel', ['sms']).notNullable()
      table.string('destination', 50).notNullable()
      table.string('code_hash').notNullable()
      table.integer('attempts').unsigned().notNullable().defaultTo(0)
      table.timestamp('expires_at').notNullable()
      table.timestamp('consumed_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id', 'purpose', 'consumed_at'])
      table.index(['destination', 'purpose', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
