import User from '#models/user'
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

const registerPayload = {
  firstName: 'Ahmed',
  lastName: 'Al Salem',
  email: 'ahmed@example.com',
  phoneNumber: '+96551234567',
  password: 'Password123!',
  passwordConfirmation: 'Password123!',
  termsAccepted: true,
}

test.group('Auth APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('registers a user, starts session, and creates phone OTP', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/auth/register')
      .json(registerPayload)
      .header('Accept', 'application/json')

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
      code: 'AUTH_REGISTERED',
      data: {
        user: {
          email: registerPayload.email,
          phoneNumber: registerPayload.phoneNumber,
          phoneVerified: false,
        },
        phoneVerification: {
          required: true,
        },
      },
    })

    const user = await User.findByOrFail('email', registerPayload.email)
    assert.isNull(user.phoneVerifiedAt)

    const [otp] = await db
      .from('user_verification_codes')
      .where('user_id', user.id)
      .where('purpose', 'phone_verification')

    assert.exists(otp)
  })

  test('rejects duplicate email and phone number', async ({ client }) => {
    await User.create({
      firstName: 'Existing',
      lastName: 'User',
      email: registerPayload.email,
      phoneNumber: registerPayload.phoneNumber,
      password: 'Password123!',
      termsAcceptedAt: DateTime.utc(),
    })

    const response = await client
      .post('/api/v1/auth/register')
      .json(registerPayload)
      .header('Accept', 'application/json')

    response.assertStatus(422)
    response.assertBodyContains({
      success: false,
      code: 'VALIDATION_ERROR',
    })
  })

  test('logs in with email and returns authenticated user', async ({ client }) => {
    const user = await User.create({
      firstName: 'Ahmed',
      lastName: 'Al Salem',
      email: registerPayload.email,
      phoneNumber: registerPayload.phoneNumber,
      password: registerPayload.password,
      termsAcceptedAt: DateTime.utc(),
    })

    const loginResponse = await client
      .post('/api/v1/auth/login')
      .json({ login: user.email, password: registerPayload.password })
      .header('Accept', 'application/json')

    loginResponse.assertStatus(200)
    loginResponse.assertBodyContains({
      success: true,
      code: 'AUTH_LOGGED_IN',
    })

    const meResponse = await client.get('/api/v1/auth/me').header('Accept', 'application/json')

    meResponse.assertStatus(200)
    meResponse.assertBodyContains({
      success: true,
      code: 'AUTH_USER',
      data: {
        user: {
          email: user.email,
        },
      },
    })
  })

  test('rejects invalid credentials', async ({ client }) => {
    await User.create({
      firstName: 'Ahmed',
      lastName: 'Al Salem',
      email: registerPayload.email,
      phoneNumber: registerPayload.phoneNumber,
      password: registerPayload.password,
      termsAcceptedAt: DateTime.utc(),
    })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ login: registerPayload.email, password: 'wrong-password' })
      .header('Accept', 'application/json')

    response.assertStatus(401)
    response.assertBodyContains({
      success: false,
      code: 'INVALID_CREDENTIALS',
    })
  })

  test('verifies phone OTP', async ({ client }) => {
    await client
      .post('/api/v1/auth/register')
      .json(registerPayload)
      .header('Accept', 'application/json')

    const response = await client
      .post('/api/v1/auth/otp/phone/verify')
      .json({ code: '123456' })
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'PHONE_VERIFIED',
      data: {
        user: {
          phoneVerified: true,
        },
      },
    })
  })

  test('logs out authenticated user', async ({ client }) => {
    await client
      .post('/api/v1/auth/register')
      .json(registerPayload)
      .header('Accept', 'application/json')

    const logoutResponse = await client
      .post('/api/v1/auth/logout')
      .header('Accept', 'application/json')

    logoutResponse.assertStatus(200)
    logoutResponse.assertBodyContains({
      success: true,
      code: 'AUTH_LOGGED_OUT',
    })

    const meResponse = await client.get('/api/v1/auth/me').header('Accept', 'application/json')

    meResponse.assertStatus(401)
    meResponse.assertBodyContains({
      success: false,
      code: 'UNAUTHENTICATED',
    })
  })
})
