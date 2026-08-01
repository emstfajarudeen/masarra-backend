import CreditTransaction from '#models/credit_transaction'
import Game from '#models/game'
import GameSession from '#models/game_session'
import GameSessionTeam from '#models/game_session_team'
import GameTranslation from '#models/game_translation'
import Payment from '#models/payment'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function createUser(email: string, phoneNumber: string) {
  return User.create({
    firstName: 'Ahmed',
    lastName: 'Al Salem',
    email,
    phoneNumber,
    password: 'Password123!',
    termsAcceptedAt: DateTime.utc(),
  })
}

async function createGame() {
  const game = await Game.create({
    slug: `history-game-${Date.now()}`,
    status: 'published',
    minTeamCount: 2,
    maxTeamCount: 6,
    allowedRoundCounts: [5, 10],
    allowedQuestionDurations: [30, 40],
    baseRoundCreditCost: 1,
    optionalCategoriesEnabled: false,
    publishedAt: DateTime.utc(),
  })

  await GameTranslation.create({
    gameId: game.id,
    locale: 'ar',
    title: 'لعبة التاريخ',
    description: 'وصف',
    instructions: 'تعليمات',
    metadata: {},
  })

  return game
}

async function createCompletedSession(user: User, game: Game) {
  const session = await GameSession.create({
    hostUserId: user.id,
    gameId: game.id,
    status: 'completed',
    selectedRoundCount: 5,
    selectedQuestionDuration: 40,
    creditReservationStatus: 'reserved',
    reservedCreditCount: 5,
    completedRoundCount: 5,
    refundedCreditCount: 0,
    lockedAt: DateTime.utc(),
    startedAt: DateTime.utc(),
    endedAt: DateTime.utc(),
  })

  await GameSessionTeam.createMany([
    {
      gameSessionId: session.id,
      name: 'Crimson',
      normalizedName: 'crimson',
      color: '#FF0000',
      score: 20,
      sortOrder: 1,
    },
    {
      gameSessionId: session.id,
      name: 'Silver',
      normalizedName: 'silver',
      color: '#C0C0C0',
      score: 10,
      sortOrder: 2,
    },
  ])

  return session
}

test.group('Account history APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('returns authenticated user game history with winner summary', async ({ client }) => {
    const user = await createUser('history-user@example.com', '+96551111111')
    const otherUser = await createUser('other-history-user@example.com', '+96552222222')
    const game = await createGame()

    const session = await createCompletedSession(user, game)
    await createCompletedSession(otherUser, game)

    const response = await client
      .get('/api/v1/account/game-history')
      .loginAs(user)
      .header('Accept-Language', 'ar')
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ACCOUNT_GAME_HISTORY',
      data: {
        sessions: [
          {
            id: session.id,
            status: 'completed',
            game: {
              title: 'لعبة التاريخ',
            },
            winners: [
              {
                name: 'Crimson',
                score: 20,
              },
            ],
          },
        ],
      },
    })
  })

  test('returns game history detail and blocks another user session', async ({ client }) => {
    const user = await createUser('history-detail-user@example.com', '+96553333333')
    const otherUser = await createUser('history-detail-other@example.com', '+96554444444')
    const game = await createGame()

    const ownSession = await createCompletedSession(user, game)
    const otherSession = await createCompletedSession(otherUser, game)

    const response = await client
      .get(`/api/v1/account/game-history/${ownSession.id}`)
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ACCOUNT_GAME_HISTORY_DETAIL',
      data: {
        session: {
          id: ownSession.id,
          teams: [
            {
              name: 'Crimson',
            },
          ],
        },
      },
    })

    const blockedResponse = await client
      .get(`/api/v1/account/game-history/${otherSession.id}`)
      .loginAs(user)
      .header('Accept', 'application/json')

    blockedResponse.assertStatus(404)
    blockedResponse.assertBodyContains({
      success: false,
      code: 'ACCOUNT_GAME_HISTORY_NOT_FOUND',
    })
  })

  test('returns purchased history scoped to user', async ({ client }) => {
    const user = await createUser('purchase-history@example.com', '+96555555555')
    const otherUser = await createUser('purchase-history-other@example.com', '+96556666666')

    const payment = await Payment.create({
      userId: user.id,
      payableType: 'optional_category',
      method: 'direct',
      status: 'paid',
      amount: '2.000',
      currency: 'KWD',
      idempotencyKey: 'payment-history-user',
      paidAt: DateTime.utc(),
      metadata: {},
    })

    await Payment.create({
      userId: otherUser.id,
      payableType: 'optional_category',
      method: 'direct',
      status: 'paid',
      amount: '2.000',
      currency: 'KWD',
      idempotencyKey: 'payment-history-other',
      paidAt: DateTime.utc(),
      metadata: {},
    })

    const response = await client
      .get('/api/v1/account/purchased-history')
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ACCOUNT_PURCHASED_HISTORY',
      data: {
        payments: [
          {
            id: payment.id,
            status: 'paid',
            amount: '2.000',
            currency: 'KWD',
          },
        ],
      },
    })
  })

  test('returns credit transaction history scoped to user', async ({ client }) => {
    const user = await createUser('credit-history@example.com', '+96557777777')
    const otherUser = await createUser('credit-history-other@example.com', '+96558888888')

    const transaction = await CreditTransaction.create({
      userId: user.id,
      type: 'grant',
      amount: 20,
      currency: 'round_credit',
      idempotencyKey: 'credit-history-user',
      description: 'Initial credits',
      metadata: {},
    })

    await CreditTransaction.create({
      userId: otherUser.id,
      type: 'grant',
      amount: 20,
      currency: 'round_credit',
      idempotencyKey: 'credit-history-other',
      description: 'Other credits',
      metadata: {},
    })

    const response = await client
      .get('/api/v1/account/credit-transactions')
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ACCOUNT_CREDIT_TRANSACTIONS',
      data: {
        transactions: [
          {
            id: transaction.id,
            type: 'grant',
            amount: 20,
            description: 'Initial credits',
          },
        ],
      },
    })
  })
})
