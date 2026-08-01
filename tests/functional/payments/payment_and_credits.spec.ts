import CreditTransaction from '#models/credit_transaction'
import Game from '#models/game'
import GameSession from '#models/game_session'
import GameSessionTeam from '#models/game_session_team'
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

async function createGame() {
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
    isEnabled: true,
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

async function createReadySession(user: User, game: Game) {
  const session = await GameSession.create({
    hostUserId: user.id,
    gameId: game.id,
    status: 'ready',
    lockedAt: DateTime.utc(),
    selectedRoundCount: 5,
    selectedQuestionDuration: 40,
  })

  await GameSessionTeam.createMany([
    {
      gameSessionId: session.id,
      name: 'Blue Team',
      normalizedName: 'blue team',
      color: '#0055FF',
      sortOrder: 0,
    },
    {
      gameSessionId: session.id,
      name: 'Gold Team',
      normalizedName: 'gold team',
      color: '#FFAA00',
      sortOrder: 1,
    },
  ])

  return session
}

test.group('Payment and credit APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns wallet balance from credit ledger', async ({ client }) => {
    const user = await createUser()

    await CreditTransaction.create({
      userId: user.id,
      type: 'grant',
      amount: 20,
      currency: 'round_credit',
      idempotencyKey: 'test:grant:20',
      description: 'Test grant',
      metadata: {},
    })

    const response = await client
      .get('/api/v1/wallet')
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'WALLET',
      data: {
        balance: 20,
        currency: 'round_credit',
      },
    })
  })

  test('reserves credits for a ready game session', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    const session = await createReadySession(user, game)

    await CreditTransaction.create({
      userId: user.id,
      type: 'grant',
      amount: 20,
      currency: 'round_credit',
      idempotencyKey: 'test:grant:reserve',
      description: 'Test grant',
      metadata: {},
    })

    const response = await client
      .post(`/api/v1/game-sessions/${session.id}/reserve-credits`)
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'GAME_SESSION_CREDITS_RESERVED',
      data: {
        session: {
          creditReservation: {
            status: 'reserved',
            reservedCreditCount: 5,
          },
        },
      },
    })

    const walletResponse = await client
      .get('/api/v1/wallet')
      .loginAs(user)
      .header('Accept', 'application/json')

    walletResponse.assertBodyContains({
      data: {
        balance: 15,
      },
    })
  })

  test('rejects reservation when wallet balance is insufficient', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    const session = await createReadySession(user, game)

    const response = await client
      .post(`/api/v1/game-sessions/${session.id}/reserve-credits`)
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(422)
    response.assertBodyContains({
      success: false,
      code: 'INSUFFICIENT_CREDITS',
    })
  })

  test('creates and confirms optional category payment intent', async ({ client, assert }) => {
    const user = await createUser()
    const game = await createGame()
    const category = await createCategory(game)
    const session = await GameSession.create({
      hostUserId: user.id,
      gameId: game.id,
      optionalQuestionCategoryId: category.id,
      status: 'payment_pending',
      lockedAt: DateTime.utc(),
      selectedRoundCount: 5,
      selectedQuestionDuration: 40,
    })

    const intentResponse = await client
      .post(`/api/v1/game-sessions/${session.id}/category-payment-intent`)
      .loginAs(user)
      .json({ method: 'direct' })
      .header('Accept', 'application/json')

    intentResponse.assertStatus(201)
    intentResponse.assertBodyContains({
      success: true,
      code: 'CATEGORY_PAYMENT_INTENT_CREATED',
      data: {
        payment: {
          payableType: 'optional_category',
          method: 'direct',
          status: 'pending',
          amount: '2.000',
          currency: 'KWD',
        },
      },
    })

    const paymentId = intentResponse.body().data.payment.id

    const confirmResponse = await client
      .post(`/api/v1/payments/${paymentId}/confirm`)
      .loginAs(user)
      .json({ providerReference: 'test-payment-reference' })
      .header('Accept', 'application/json')

    confirmResponse.assertStatus(200)
    confirmResponse.assertBodyContains({
      success: true,
      code: 'PAYMENT_CONFIRMED',
      data: {
        payment: {
          status: 'paid',
          providerReference: 'test-payment-reference',
        },
      },
    })

    await session.refresh()
    assert.equal(session.status, 'ready')
    assert.equal(session.categoryPaymentId, paymentId)
  })
})
