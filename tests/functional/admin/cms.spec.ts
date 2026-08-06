import ContactMessage from '#models/contact_message'
import ContentPage from '#models/content_page'
import Game from '#models/game'
import Question from '#models/question'
import QuestionCategory from '#models/question_category'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function createUser(role: 'user' | 'admin' = 'admin') {
  return User.create({
    firstName: role === 'admin' ? 'Admin' : 'Regular',
    lastName: 'User',
    email: `${role}-${Date.now()}@example.com`,
    phoneNumber: role === 'admin' ? '+96550000001' : '+96550000002',
    password: 'Password123!',
    role,
    termsAcceptedAt: DateTime.utc(),
  })
}

const gamePayload = {
  slug: 'masarra-classic',
  status: 'published',
  minTeamCount: 2,
  maxTeamCount: 6,
  allowedRoundCounts: [5, 10],
  allowedQuestionDurations: [30, 40],
  baseRoundCreditCost: 1,
  optionalCategoriesEnabled: true,
  sortOrder: 1,
  translations: [
    {
      locale: 'ar',
      title: 'مسرة كلاسيك',
      description: 'لعبة عائلية',
      instructions: 'ابدأ اللعب',
      metadata: {},
    },
  ],
}

test.group('Admin CMS APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('rejects non-admin users from admin CMS routes', async ({ client }) => {
    const user = await createUser('user')

    const response = await client
      .get('/api/v1/admin/games')
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(403)
    response.assertBodyContains({
      success: false,
      code: 'ADMIN_ACCESS_REQUIRED',
    })
  })

  test('creates and updates a game with translations', async ({ client }) => {
    const admin = await createUser()

    const createResponse = await client
      .post('/api/v1/admin/games')
      .loginAs(admin)
      .json(gamePayload)
      .header('Accept', 'application/json')

    createResponse.assertStatus(201)
    createResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_GAME_CREATED',
      data: {
        game: {
          slug: 'masarra-classic',
          status: 'published',
          minTeamCount: 2,
          maxTeamCount: 6,
        },
      },
    })

    const game = await Game.findByOrFail('slug', 'masarra-classic')

    const updateResponse = await client
      .put(`/api/v1/admin/games/${game.id}`)
      .loginAs(admin)
      .json({
        ...gamePayload,
        status: 'draft',
        translations: [{ ...gamePayload.translations[0], title: 'مسرة محدثة' }],
      })
      .header('Accept', 'application/json')

    updateResponse.assertStatus(200)
    updateResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_GAME_UPDATED',
      data: {
        game: {
          slug: 'masarra-classic',
          status: 'draft',
          translations: [
            {
              title: 'مسرة محدثة',
            },
          ],
        },
      },
    })
  })

  test('creates category and question records for a game', async ({ client }) => {
    const admin = await createUser()

    await client
      .post('/api/v1/admin/games')
      .loginAs(admin)
      .json(gamePayload)
      .header('Accept', 'application/json')

    const game = await Game.findByOrFail('slug', 'masarra-classic')

    const categoryResponse = await client
      .post(`/api/v1/admin/games/${game.id}/categories`)
      .loginAs(admin)
      .json({
        slug: 'ramadan',
        status: 'published',
        priceAmount: '2.000',
        priceCurrency: 'KWD',
        sortOrder: 1,
        translations: [
          {
            locale: 'ar',
            title: 'رمضان',
            description: 'أسئلة رمضانية',
            metadata: {},
          },
        ],
      })
      .header('Accept', 'application/json')

    categoryResponse.assertStatus(201)
    categoryResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_QUESTION_CATEGORY_CREATED',
      data: {
        category: {
          slug: 'ramadan',
          priceAmount: '2.000',
        },
      },
    })

    const category = await QuestionCategory.findByOrFail('slug', 'ramadan')

    const questionResponse = await client
      .post('/api/v1/admin/questions')
      .loginAs(admin)
      .json({
        gameId: game.id,
        questionCategoryId: category.id,
        status: 'published',
        type: 'knowledge',
        basePoints: 5,
        sortOrder: 1,
        metadata: {},
        translations: [
          {
            locale: 'ar',
            prompt: 'ما عاصمة الكويت؟',
            correctAnswer: 'مدينة الكويت',
            explanation: 'مدينة الكويت هي العاصمة.',
            metadata: {},
          },
        ],
      })
      .header('Accept', 'application/json')

    questionResponse.assertStatus(201)
    questionResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_QUESTION_CREATED',
      data: {
        question: {
          gameId: game.id,
          questionCategoryId: category.id,
          basePoints: 5,
          translations: [
            {
              correctAnswer: 'مدينة الكويت',
            },
          ],
        },
      },
    })

    await Question.findOrFail(questionResponse.body().data.question.id)
  })

  test('creates content page and updates contact message status', async ({ client }) => {
    const admin = await createUser()

    const pageResponse = await client
      .post('/api/v1/admin/content-pages')
      .loginAs(admin)
      .json({
        slug: 'terms',
        status: 'published',
        sortOrder: 1,
        translations: [
          {
            locale: 'ar',
            title: 'الشروط والأحكام',
            excerpt: 'ملخص الشروط',
            body: 'نص الشروط والأحكام',
            metadata: {},
          },
        ],
      })
      .header('Accept', 'application/json')

    pageResponse.assertStatus(201)
    pageResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_CONTENT_PAGE_CREATED',
      data: {
        page: {
          slug: 'terms',
          status: 'published',
        },
      },
    })

    await ContentPage.findByOrFail('slug', 'terms')

    const message = await ContactMessage.create({
      fullName: 'Ahmed',
      email: 'ahmed@example.com',
      message: 'Need support',
      status: 'new',
    })

    const statusResponse = await client
      .patch(`/api/v1/admin/contact-messages/${message.id}/status`)
      .loginAs(admin)
      .json({ status: 'reviewed' })
      .header('Accept', 'application/json')

    statusResponse.assertStatus(200)
    statusResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_CONTACT_MESSAGE_UPDATED',
      data: {
        message: {
          status: 'reviewed',
        },
      },
    })
  })
})
