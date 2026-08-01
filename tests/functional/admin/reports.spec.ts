import ContactMessage from '#models/contact_message'
import Game from '#models/game'
import GameSession from '#models/game_session'
import Payment from '#models/payment'
import Question from '#models/question'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { DateTime } from 'luxon'

async function createUser(role: 'user' | 'admin', suffix: string) {
  return User.create({
    firstName: role === 'admin' ? 'Admin' : 'Regular',
    lastName: 'User',
    email: `${role}-reports-${suffix}@example.com`,
    phoneNumber: role === 'admin' ? '+96559990001' : '+96559990002',
    password: 'Password123!',
    role,
    termsAcceptedAt: DateTime.utc(),
  })
}

async function seedReportData(admin: User) {
  const game = await Game.create({
    slug: 'report-game',
    status: 'published',
    minTeamCount: 2,
    maxTeamCount: 6,
    allowedRoundCounts: [5, 10],
    allowedQuestionDurations: [30, 40],
    baseRoundCreditCost: 1,
    optionalCategoriesEnabled: false,
    publishedAt: DateTime.utc(),
  })

  await Question.create({
    gameId: game.id,
    status: 'published',
    type: 'knowledge',
    basePoints: 5,
    metadata: {},
  })

  await GameSession.create({
    hostUserId: admin.id,
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

  await Payment.create({
    userId: admin.id,
    payableType: 'optional_category',
    method: 'direct',
    status: 'paid',
    amount: '2.000',
    currency: 'KWD',
    idempotencyKey: 'report-paid-payment',
    paidAt: DateTime.utc(),
    metadata: {},
  })

  await Payment.create({
    userId: admin.id,
    payableType: 'optional_category',
    method: 'direct',
    status: 'pending',
    amount: '2.000',
    currency: 'KWD',
    idempotencyKey: 'report-pending-payment',
    metadata: {},
  })

  await ContactMessage.create({
    fullName: 'Ahmed',
    email: 'ahmed@example.com',
    message: 'Need support',
    status: 'new',
  })

  return game
}

test.group('Admin report APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('requires admin access for dashboard summary', async ({ client }) => {
    const user = await createUser('user', 'guard')

    const response = await client
      .get('/api/v1/admin/dashboard/summary')
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(403)
    response.assertBodyContains({
      success: false,
      code: 'ADMIN_ACCESS_REQUIRED',
    })
  })

  test('returns dashboard summary counters', async ({ client }) => {
    const admin = await createUser('admin', 'summary')
    await seedReportData(admin)

    const response = await client
      .get('/api/v1/admin/dashboard/summary')
      .loginAs(admin)
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ADMIN_DASHBOARD_SUMMARY',
      data: {
        users: {
          total: 1,
          active: 1,
        },
        catalog: {
          games: {
            total: 1,
            published: 1,
          },
          questions: {
            total: 1,
            published: 1,
          },
        },
        sessions: {
          total: 1,
          completed: 1,
        },
        payments: {
          paidCount: 1,
          revenue: [
            {
              currency: 'KWD',
              amount: '2.000',
            },
          ],
        },
        contactMessages: {
          new: 1,
        },
      },
    })
  })

  test('returns payment and session report aggregates', async ({ client }) => {
    const admin = await createUser('admin', 'aggregates')
    const game = await seedReportData(admin)

    const paymentsResponse = await client
      .get('/api/v1/admin/reports/payments')
      .loginAs(admin)
      .header('Accept', 'application/json')

    paymentsResponse.assertStatus(200)
    paymentsResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_PAYMENT_REPORT',
      data: {
        byStatus: [
          {
            key: 'paid',
            count: 1,
          },
          {
            key: 'pending',
            count: 1,
          },
        ],
      },
    })

    const sessionsResponse = await client
      .get('/api/v1/admin/reports/game-sessions')
      .loginAs(admin)
      .header('Accept', 'application/json')

    sessionsResponse.assertStatus(200)
    sessionsResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_GAME_SESSION_REPORT',
      data: {
        roundTotals: {
          selected: 5,
          completed: 5,
          reservedCredits: 5,
          refundedCredits: 0,
        },
        mostPlayedGames: [
          {
            id: game.id,
            slug: 'report-game',
            sessionCount: 1,
          },
        ],
      },
    })
  })

  test('returns user and contact message reports', async ({ client }) => {
    const admin = await createUser('admin', 'users')
    await seedReportData(admin)

    const usersResponse = await client
      .get('/api/v1/admin/reports/users')
      .loginAs(admin)
      .header('Accept', 'application/json')

    usersResponse.assertStatus(200)
    usersResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_USER_REPORT',
      data: {
        registeredCount: 1,
        byRole: [
          {
            key: 'admin',
            count: 1,
          },
        ],
      },
    })

    const contactResponse = await client
      .get('/api/v1/admin/reports/contact-messages')
      .loginAs(admin)
      .header('Accept', 'application/json')

    contactResponse.assertStatus(200)
    contactResponse.assertBodyContains({
      success: true,
      code: 'ADMIN_CONTACT_MESSAGE_REPORT',
      data: {
        byStatus: [
          {
            key: 'new',
            count: 1,
          },
        ],
      },
    })
  })
})
