import CreditTransaction from '#models/credit_transaction'
import Game from '#models/game'
import GameSession from '#models/game_session'
import GameSessionRound from '#models/game_session_round'
import GameSessionTeam from '#models/game_session_team'
import GameTranslation from '#models/game_translation'
import Question from '#models/question'
import QuestionTranslation from '#models/question_translation'
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

async function createQuestion(game: Game, basePoints = 5) {
  const question = await Question.create({
    gameId: game.id,
    questionCategoryId: null,
    status: 'published',
    type: 'knowledge',
    basePoints,
    publishedAt: DateTime.utc(),
    metadata: {},
  })

  await QuestionTranslation.create({
    questionId: question.id,
    locale: 'ar',
    prompt: 'ما عاصمة الكويت؟',
    correctAnswer: 'الكويت',
    explanation: 'مدينة الكويت هي العاصمة.',
    metadata: {},
  })

  return question
}

async function createActiveSession(user: User, game: Game) {
  const session = await GameSession.create({
    hostUserId: user.id,
    gameId: game.id,
    status: 'active',
    lockedAt: DateTime.utc(),
    startedAt: DateTime.utc(),
    selectedRoundCount: 3,
    selectedQuestionDuration: 40,
    creditReservationStatus: 'reserved',
    reservedCreditCount: 3,
    creditsReservedAt: DateTime.utc(),
    currentRoundNumber: 1,
  })

  const teams = await GameSessionTeam.createMany([
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

  const round = await GameSessionRound.create({
    gameSessionId: session.id,
    roundNumber: 1,
    status: 'active',
    creditOutcome: 'reserved',
    startedAt: DateTime.utc(),
    metadata: {},
  })

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

  return { session, teams, round }
}

test.group('Question and scoring APIs', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('assigns a question to an active round', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    await createQuestion(game)
    const { session, round } = await createActiveSession(user, game)

    const response = await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/${round.id}/question`)
      .loginAs(user)
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ROUND_QUESTION_ASSIGNED',
      data: {
        roundId: round.id,
        roundNumber: 1,
        question: {
          basePoints: 5,
          prompt: 'ما عاصمة الكويت؟',
          locale: 'ar',
        },
      },
    })
  })

  test('scores a normal round and updates scoreboard', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    await createQuestion(game, 5)
    const { session, teams, round } = await createActiveSession(user, game)

    await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/${round.id}/question`)
      .loginAs(user)

    const response = await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/${round.id}/score`)
      .loginAs(user)
      .json({
        winnerTeamId: teams[0].id,
        scoringRule: 'normal',
        submittedAnswer: 'الكويت',
      })
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      success: true,
      code: 'ROUND_SCORED',
      data: {
        round: {
          status: 'completed',
          scoringRule: 'normal',
          awardedPoints: 5,
        },
        scoreboard: {
          teams: [{ id: teams[0].id, score: 5 }],
        },
      },
    })
  })

  test('applies double scoring', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    await createQuestion(game, 5)
    const { session, teams, round } = await createActiveSession(user, game)

    await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/${round.id}/question`)
      .loginAs(user)

    const response = await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/${round.id}/score`)
      .loginAs(user)
      .json({
        winnerTeamId: teams[0].id,
        scoringRule: 'double',
      })
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        round: {
          scoringRule: 'double',
          awardedPoints: 10,
        },
        scoreboard: {
          teams: [{ id: teams[0].id, score: 10 }],
        },
      },
    })
  })

  test('applies steal scoring by deducting 3 from other teams', async ({ client }) => {
    const user = await createUser()
    const game = await createGame()
    await createQuestion(game, 5)
    const { session, teams, round } = await createActiveSession(user, game)

    teams[1].score = 8
    await teams[1].save()

    await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/${round.id}/question`)
      .loginAs(user)

    const response = await client
      .post(`/api/v1/game-sessions/${session.id}/rounds/${round.id}/score`)
      .loginAs(user)
      .json({
        winnerTeamId: teams[0].id,
        scoringRule: 'steal',
      })
      .header('Accept', 'application/json')

    response.assertStatus(200)
    response.assertBodyContains({
      data: {
        round: {
          scoringRule: 'steal',
          awardedPoints: 5,
        },
      },
    })

    const scoreboardResponse = await client
      .get(`/api/v1/game-sessions/${session.id}/scoreboard`)
      .loginAs(user)
      .header('Accept', 'application/json')

    scoreboardResponse.assertBodyContains({
      success: true,
      code: 'SCOREBOARD',
      data: {
        teams: [
          { id: teams[0].id, score: 5 },
          { id: teams[1].id, score: 5 },
        ],
      },
    })
  })
})
