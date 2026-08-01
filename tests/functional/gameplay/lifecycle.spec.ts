import CreditTransaction from '#models/credit_transaction'
import Game from '#models/game'
import GameSession from '#models/game_session'
import GameSessionTeam from '#models/game_session_team'
import GameTranslation from '#models/game_translation'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function createUser() {
  return User.create({
    firstName: 'Ahmed',
    lastName: 'Al Salem',
    email: 'host@example.com',
    phoneNumber: '+96551234567',
    password: 'Password123!',
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
    allowedRoundCounts: [3],
    allowedQuestionDurations: [40],
    baseRoundCreditCost: 1,
    optionalCategoriesEnabled: false,
    publishedAt: DateTime.utc(),
  })

  await GameTranslation.create({
    gameId: game.id,
    locale: 'ar',
    title: 'مسرة كلاسيك',
    description: 'لعبة عائلية',
    instructions: 'ابدأ اللعب.',
    metadata: {},
  })

  return game
}

async function createReservedSession(user: User, game: Game) {
  const session = await GameSession.create({
    hostUserId: user.id,
    gameId: game.id,
    status: 'ready',
    lockedAt: DateTime.utc(),
    selectedRoundCount: 3,
    selectedQuestionDuration: 40,
    creditReservationStatus: 'reserved',
    reservedCreditCount: 3,
    creditsReservedAt: DateTime.utc(),
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

  await CreditTransaction.create({
    userId: user.id,
    gameSessionId: session.id,
    type: 'reservation',
    amount: -3,
    currency: 'round_credit',
    idempotencyKey: `game_session:${session.id}:credit_reservation`,
    description: 'Reserved 3 credits.',
    metadata: {},
  })

  return session
}

test.group('Gameplay lifecycle APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('starts a reserved game session and creates pending rounds', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    const session = await createReservedSession(user, game)

    const response = await client
      .post(`/api/v1/game-sessions/${session.id}/start`)
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'GAME_STARTED',
      data: {
        session: {
          status: 'active',
          rounds: [
            { roundNumber: 1, status: 'pending', creditOutcome: 'reserved' },
            { roundNumber: 2, status: 'pending', creditOutcome: 'reserved' },
            { roundNumber: 3, status: 'pending', creditOutcome: 'reserved' },
          ],
        },
      },
    })
  })

  test('starts and completes a round', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    const session = await createReservedSession(user, game)

    await client.post(`/api/v1/game-sessions/${session.id}/start`).loginAs(user)

    const roundResponse = await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/next`)
      .loginAs(user)
      .header('Accept', 'application/json')

    roundResponse.assertStatus(200)
    const roundId = roundResponse.body().data.round.id

    const completeResponse = await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/${roundId}/complete`)
      .loginAs(user)
      .json({ metadata: { winnerTeamId: 'placeholder-team-id' } })
      .header('Accept', 'application/json')

    completeResponse.assertStatus(200)
    completeResponse.assertBodyContains({
      success: true,
      code: 'ROUND_COMPLETED',
      data: {
        round: {
          status: 'completed',
          creditOutcome: 'charged',
        },
        session: {
          completedRoundCount: 1,
          currentRoundNumber: null,
        },
      },
    })
  })

  test('refunds active round for system failure', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    const session = await createReservedSession(user, game)

    await client.post(`/api/v1/game-sessions/${session.id}/start`).loginAs(user)
    const roundResponse = await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/next`)
      .loginAs(user)
    const roundId = roundResponse.body().data.round.id

    const response = await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/${roundId}/abandon`)
      .loginAs(user)
      .json({ reason: 'system_failure' })
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ROUND_ABANDONED',
      data: {
        round: {
          status: 'abandoned',
          creditOutcome: 'refunded',
        },
        session: {
          refundedCreditCount: 1,
        },
      },
    })
  })

  test('host stop forfeits active round and refunds unstarted rounds', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    const session = await createReservedSession(user, game)

    await client.post(`/api/v1/game-sessions/${session.id}/start`).loginAs(user)
    await client.post(`/api/v1/game-sessions/${session.id}/rounds/next`).loginAs(user)

    const response = await client
      .post(`/api/v1/game-sessions/${session.id}/stop`)
      .loginAs(user)
      .json({ reason: 'host_stopped' })
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'GAME_STOPPED',
      data: {
        session: {
          status: 'cancelled',
          refundedCreditCount: 2,
          rounds: [
            { roundNumber: 1, status: 'cancelled', creditOutcome: 'forfeited' },
            { roundNumber: 2, status: 'cancelled', creditOutcome: 'refunded' },
            { roundNumber: 3, status: 'cancelled', creditOutcome: 'refunded' },
          ],
        },
      },
    })
  })
})
