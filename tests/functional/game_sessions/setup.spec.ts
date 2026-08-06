import Game from '#models/game'
import GameSession from '#models/game_session'
import GameTranslation from '#models/game_translation'
import QuestionCategory from '#models/question_category'
import QuestionCategoryTranslation from '#models/question_category_translation'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

const password = 'Password123!'

async function createUser() {
  return User.create({
    firstName: 'Ahmed',
    lastName: 'Al Salem',
    email: 'host@example.com',
    phoneNumber: '+96551234567',
    password,
    status: 'active',
    preferredLocale: 'ar',
    phoneVerifiedAt: DateTime.utc(),
    termsAcceptedAt: DateTime.utc(),
  })
}

async function createGame(options: Partial<Game> = {}) {
  const game = await Game.create({
    slug: 'masarra-classic',
    status: 'published',
    minTeamCount: 2,
    maxTeamCount: 6,
    allowedRoundCounts: [5, 10],
    allowedQuestionDurations: [40, 60],
    baseRoundCreditCost: 1,
    optionalCategoriesEnabled: true,
    publishedAt: DateTime.utc(),
    ...options,
  })

  await GameTranslation.create({
    gameId: game.id,
    locale: 'ar',
    title: 'مسرة كلاسيك',
    description: 'لعبة عائلية',
    instructions: 'اقرأ التعليمات وابدأ اللعب.',
    metadata: {},
  })

  return game
}

async function createCategory(game: Game) {
  const category = await QuestionCategory.create({
    gameId: game.id,
    slug: 'ramadan',
    status: 'published',
    priceAmount: '2.000',
    priceCurrency: 'KWD',
    publishedAt: DateTime.utc(),
  })

  await QuestionCategoryTranslation.create({
    questionCategoryId: category.id,
    locale: 'ar',
    title: 'رمضان',
    description: 'اسئلة رمضانية',
    metadata: {},
  })

  return category
}

test.group('Game session setup APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates a draft game session for the authenticated host', async ({ client }) => {
    const user = await createUser()
    await createGame()

    const response = await client
      .post('/api/v1/game-sessions')
      .loginAs(user)
      .json({ gameSlug: 'masarra-classic' })
      .header('Accept', 'application/json')

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
      code: 'GAME_SESSION_CREATED',
      data: {
        session: {
          status: 'draft',
          selectedRoundCount: null,
          selectedQuestionDuration: null,
          game: {
            slug: 'masarra-classic',
            setup: {
              minTeamCount: 2,
              maxTeamCount: 6,
            },
          },
          teams: [],
        },
      },
    })
  })

  test('updates teams and rejects duplicate team names', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    const session = await GameSession.create({
      hostUserId: user.id,
      gameId: game.id,
      status: 'draft',
    })

    const response = await client
      .patch(`/api/v1/game-sessions/${session.id}/teams`)
      .loginAs(user)
      .json({
        teams: [
          { name: 'Blue Team', color: '#0055FF' },
          { name: 'Blue   Team', color: '#FFAA00' },
        ],
      })
      .header('Accept', 'application/json')

    response.assertStatus(422)
    response.assertBodyContains({
      success: false,
      code: 'DUPLICATE_TEAM_NAME',
    })
  })

  test('updates teams, settings, optional category, and locks setup', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    await createCategory(game)
    const session = await GameSession.create({
      hostUserId: user.id,
      gameId: game.id,
      status: 'draft',
    })

    const teamsResponse = await client
      .patch(`/api/v1/game-sessions/${session.id}/teams`)
      .loginAs(user)
      .json({
        teams: [
          { name: 'Blue Team', color: '#0055FF' },
          { name: 'Gold Team', color: '#FFAA00' },
        ],
      })
      .header('Accept', 'application/json')

    teamsResponse.assertStatus(200)
    teamsResponse.assertBodyContains({
      success: true,
      code: 'GAME_SESSION_TEAMS_UPDATED',
      data: {
        session: {
          teams: [
            { name: 'Blue Team', color: '#0055FF' },
            { name: 'Gold Team', color: '#FFAA00' },
          ],
        },
      },
    })

    const settingsResponse = await client
      .patch(`/api/v1/game-sessions/${session.id}/settings`)
      .loginAs(user)
      .json({ roundCount: 5, questionDuration: 40 })
      .header('Accept', 'application/json')

    settingsResponse.assertStatus(200)
    settingsResponse.assertBodyContains({
      success: true,
      code: 'GAME_SESSION_SETTINGS_UPDATED',
      data: {
        session: {
          selectedRoundCount: 5,
          selectedQuestionDuration: 40,
        },
      },
    })

    const categoryResponse = await client
      .post(`/api/v1/game-sessions/${session.id}/optional-category`)
      .loginAs(user)
      .json({ categorySlug: 'ramadan' })
      .header('Accept', 'application/json')

    categoryResponse.assertStatus(200)
    categoryResponse.assertBodyContains({
      success: true,
      code: 'GAME_SESSION_CATEGORY_UPDATED',
      data: {
        session: {
          selectedCategory: {
            slug: 'ramadan',
            price: {
              amount: '2.000',
              currency: 'KWD',
            },
          },
        },
      },
    })

    const lockResponse = await client
      .post(`/api/v1/game-sessions/${session.id}/lock`)
      .loginAs(user)
      .header('Accept', 'application/json')

    lockResponse.assertStatus(200)
    lockResponse.assertBodyContains({
      success: true,
      code: 'GAME_SESSION_LOCKED',
      data: {
        session: {
          status: 'payment_pending',
          locked: true,
        },
      },
    })
  })

  test('rejects settings not allowed by the selected game', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    const session = await GameSession.create({
      hostUserId: user.id,
      gameId: game.id,
      status: 'draft',
    })

    const response = await client
      .patch(`/api/v1/game-sessions/${session.id}/settings`)
      .loginAs(user)
      .json({ roundCount: 7, questionDuration: 40 })
      .header('Accept', 'application/json')

    response.assertStatus(422)
    response.assertBodyContains({
      success: false,
      code: 'INVALID_ROUND_COUNT',
    })
  })

  test('rejects setup changes after locking', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    const session = await GameSession.create({
      hostUserId: user.id,
      gameId: game.id,
      status: 'ready',
      lockedAt: DateTime.utc(),
      selectedRoundCount: 5,
      selectedQuestionDuration: 40,
    })

    const response = await client
      .patch(`/api/v1/game-sessions/${session.id}/settings`)
      .loginAs(user)
      .json({ roundCount: 10, questionDuration: 60 })
      .header('Accept', 'application/json')

    response.assertStatus(409)
    response.assertBodyContains({
      success: false,
      code: 'GAME_SESSION_LOCKED',
    })
  })
})
