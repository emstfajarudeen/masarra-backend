import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class AdminSeeder extends BaseSeeder {
  async run() {
    await User.updateOrCreate(
      { email: 'admin@masarra.com' },
      {
        firstName: 'Admin',
        lastName: 'Masarra',
        email: 'admin@masarra.com',
        phoneNumber: '+0000000000',
        password: 'password',
        status: 'active',
        role: 'admin',
        preferredLocale: 'en',
        emailVerifiedAt: DateTime.now(),
        phoneVerifiedAt: DateTime.now(),
        termsAcceptedAt: DateTime.now(),
      }
    )
  }
}
