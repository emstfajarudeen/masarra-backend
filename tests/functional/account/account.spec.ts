import ContentPage from '#models/content_page'
import ContentPageTranslation from '#models/content_page_translation'
import ContactMessage from '#models/contact_message'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

const password = 'Password123!'

async function createUser(overrides: Partial<User> = {}) {
  return User.create({
    firstName: 'Ahmed',
    lastName: 'Al Salem',
    email: 'ahmed@example.com',
    phoneNumber: '+96551234567',
    password,
    status: 'active',
    preferredLocale: 'ar',
    phoneVerifiedAt: DateTime.utc(),
    termsAcceptedAt: DateTime.utc(),
    ...overrides,
  })
}

test.group('Account APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns the authenticated account profile', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .get('/api/v1/account/me')
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ACCOUNT_PROFILE',
      data: {
        user: {
          email: user.email,
          phoneVerified: true,
        },
      },
    })
  })

  test('updates profile and requires OTP again when phone number changes', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .patch('/api/v1/account/profile')
      .loginAs(user)
      .json({
        firstName: 'Sara',
        lastName: 'Al Mutairi',
        email: 'sara@example.com',
        phoneNumber: '+96552345678',
      })
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ACCOUNT_PROFILE_UPDATED',
      data: {
        user: {
          email: 'sara@example.com',
          phoneNumber: '+96552345678',
          phoneVerified: false,
        },
        phoneVerification: {
          required: true,
        },
      },
    })
  })

  test('changes password after validating old password', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .patch('/api/v1/account/password')
      .loginAs(user)
      .json({
        oldPassword: password,
        password: 'NewPassword123!',
        passwordConfirmation: 'NewPassword123!',
      })
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ACCOUNT_PASSWORD_CHANGED',
    })

    const loginResponse = await client
      .post('/api/v1/auth/login')
      .json({ login: user.email, password: 'NewPassword123!' })
      .header('Accept', 'application/json')

    loginResponse.assertStatus(200)
  })

  test('rejects an incorrect old password', async ({ client }) => {
    const user = await createUser()

    const response = await client
      .patch('/api/v1/account/password')
      .loginAs(user)
      .json({
        oldPassword: 'wrong-password',
        password: 'NewPassword123!',
        passwordConfirmation: 'NewPassword123!',
      })
      .header('Accept', 'application/json')

    response.assertStatus(422)
    response.assertBodyContains({
      success: false,
      code: 'INVALID_OLD_PASSWORD',
    })
  })
})

test.group('Public content APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns a published content page in the requested locale', async ({ client }) => {
    const page = await ContentPage.create({
      slug: 'terms',
      status: 'published',
      publishedAt: DateTime.utc(),
    })

    await ContentPageTranslation.createMany([
      {
        contentPageId: page.id,
        locale: 'ar',
        title: 'الشروط والاحكام',
        body: 'محتوى الشروط والاحكام',
        metadata: {},
      },
      {
        contentPageId: page.id,
        locale: 'en',
        title: 'Terms and Conditions',
        body: 'Terms and conditions body',
        metadata: {},
      },
    ])

    const response = await client
      .get('/api/v1/pages/terms')
      .header('Accept-Language', 'en')
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'CONTENT_PAGE',
      data: {
        slug: 'terms',
        title: 'Terms and Conditions',
        locale: 'en',
      },
    })
  })

  test('stores a contact message', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/contact')
      .json({
        fullName: 'Ahmed Al Salem',
        email: 'ahmed@example.com',
        message: 'I need help with my account setup.',
      })
      .header('Accept', 'application/json')

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
      code: 'CONTACT_MESSAGE_SUBMITTED',
    })

    const message = await ContactMessage.findByOrFail('email', 'ahmed@example.com')
    assert.equal(message.status, 'new')
  })
})
