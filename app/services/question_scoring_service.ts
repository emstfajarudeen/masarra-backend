import GameSession from '#models/game_session'
import GameSessionRound from '#models/game_session_round'
import GameSessionRoundAnswer from '#models/game_session_round_answer'
import GameSessionTeam from '#models/game_session_team'
import Question from '#models/question'
import type User from '#models/user'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export type ScoringRule = 'normal' | 'double' | 'steal'

interface ScoreRoundPayload {
  winnerTeamId: string
  scoringRule?: ScoringRule
  submittedAnswer?: string | null
  isCorrect?: boolean
  metadata?: Record<string, unknown>
}

export default class QuestionScoringService {
  async getOwnedSession(sessionId: string, host: User) {
    const session = await GameSession.query()
      .where('id', sessionId)
      .where('host_user_id', host.id)
      .preload('teams', (query) => query.orderBy('sort_order', 'asc'))
      .preload('rounds', (query) => query.orderBy('round_number', 'asc'))
      .first()

    if (!session) {
      throw new Exception('Game session was not found.', {
        status: 404,
        code: 'GAME_SESSION_NOT_FOUND',
      })
    }

    return session
  }

  async assignQuestion(session: GameSession, roundId: string, locale: string) {
    this.ensureActiveSession(session)

    const round = await this.getActiveRound(session.id, roundId)

    if (round.questionId) {
      return this.getRoundQuestion(round, locale)
    }

    const usedQuestionIds = await GameSessionRound.query()
      .where('game_session_id', session.id)
      .whereNotNull('question_id')
      .select('question_id')

    const questionQuery = Question.query()
      .where('game_id', session.gameId)
      .where('status', 'published')
      .preload('translations', (query) => this.translationQuery(query, locale))
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'asc')

    if (session.optionalQuestionCategoryId) {
      questionQuery.where('question_category_id', session.optionalQuestionCategoryId)
    } else {
      questionQuery.whereNull('question_category_id')
    }

    const usedIds = usedQuestionIds
      .map((usedRound) => usedRound.questionId)
      .filter((questionId): questionId is string => questionId !== null)

    if (usedIds.length > 0) {
      questionQuery.whereNotIn('id', usedIds)
    }

    const question = await questionQuery.first()
    const translation = question?.translations[0]

    if (!question || !translation) {
      throw new Exception('No question is available for this round.', {
        status: 404,
        code: 'QUESTION_NOT_AVAILABLE',
      })
    }

    round.questionId = question.id
    await round.save()

    return { round, question, translation }
  }

  async getRoundQuestion(round: GameSessionRound, locale: string) {
    if (!round.questionId) {
      throw new Exception('Round has no assigned question.', {
        status: 404,
        code: 'ROUND_QUESTION_NOT_ASSIGNED',
      })
    }

    const question = await Question.query()
      .where('id', round.questionId)
      .preload('translations', (query) => this.translationQuery(query, locale))
      .first()

    const translation = question?.translations[0]

    if (!question || !translation) {
      throw new Exception('Question was not found.', {
        status: 404,
        code: 'QUESTION_NOT_FOUND',
      })
    }

    return { round, question, translation }
  }

  async scoreRound(session: GameSession, roundId: string, payload: ScoreRoundPayload) {
    this.ensureActiveSession(session)

    const round = await this.getActiveRound(session.id, roundId)

    if (!round.questionId) {
      throw new Exception('Round question must be assigned before scoring.', {
        status: 422,
        code: 'ROUND_QUESTION_REQUIRED',
      })
    }

    const winnerTeam = await GameSessionTeam.query()
      .where('id', payload.winnerTeamId)
      .where('game_session_id', session.id)
      .first()

    if (!winnerTeam) {
      throw new Exception('Winning team was not found.', {
        status: 404,
        code: 'WINNER_TEAM_NOT_FOUND',
      })
    }

    const question = await Question.findOrFail(round.questionId)
    const scoringRule = payload.scoringRule ?? 'normal'
    const awardedPoints = scoringRule === 'double' ? question.basePoints * 2 : question.basePoints

    await db.transaction(async (trx) => {
      session.useTransaction(trx)
      round.useTransaction(trx)
      winnerTeam.useTransaction(trx)

      winnerTeam.score += awardedPoints
      await winnerTeam.save()

      if (scoringRule === 'steal') {
        const otherTeams = await GameSessionTeam.query({ client: trx })
          .where('game_session_id', session.id)
          .whereNot('id', winnerTeam.id)

        for (const team of otherTeams) {
          team.score -= 3
          await team.save()
        }
      }

      await GameSessionRoundAnswer.create(
        {
          gameSessionRoundId: round.id,
          teamId: winnerTeam.id,
          submittedAnswer: payload.submittedAnswer ?? null,
          isCorrect: payload.isCorrect ?? true,
          pointsAwarded: awardedPoints,
          scoringRule,
          metadata: payload.metadata ?? {},
        },
        { client: trx }
      )

      round.status = 'completed'
      round.creditOutcome = 'charged'
      round.completedAt = DateTime.utc()
      round.winnerTeamId = winnerTeam.id
      round.scoringRule = scoringRule
      round.awardedPoints = awardedPoints
      round.metadata = {
        ...round.metadata,
        scoredAt: DateTime.utc().toISO(),
      }
      await round.save()

      session.completedRoundCount += 1
      session.currentRoundNumber = null

      if (session.completedRoundCount >= (session.selectedRoundCount ?? 0)) {
        session.status = 'completed'
        session.endedAt = DateTime.utc()
        session.creditReservationStatus = 'forfeited'
      }

      await session.save()
    })

    await session.load('teams', (query) => query.orderBy('sort_order', 'asc'))
    await session.load('rounds', (query) => query.orderBy('round_number', 'asc'))
    await round.refresh()

    return round
  }

  async getScoreboard(session: GameSession) {
    await session.load('teams', (query) => query.orderBy('sort_order', 'asc'))
    return session.teams
  }

  private ensureActiveSession(session: GameSession) {
    if (session.status !== 'active') {
      throw new Exception('Game session is not active.', {
        status: 409,
        code: 'GAME_SESSION_NOT_ACTIVE',
      })
    }
  }

  private async getActiveRound(sessionId: string, roundId: string) {
    const round = await GameSessionRound.query()
      .where('id', roundId)
      .where('game_session_id', sessionId)
      .first()

    if (!round) {
      throw new Exception('Round was not found.', {
        status: 404,
        code: 'ROUND_NOT_FOUND',
      })
    }

    if (round.status !== 'active') {
      throw new Exception('Round is not active.', {
        status: 409,
        code: 'ROUND_NOT_ACTIVE',
      })
    }

    return round
  }

  private translationQuery(
    query: {
      whereIn(columns: string, values: string[]): unknown
      orderByRaw(sql: string, bindings: string[]): unknown
    },
    locale: string
  ) {
    query.whereIn('locale', [locale, 'ar'])
    query.orderByRaw('CASE WHEN locale = ? THEN 0 ELSE 1 END', [locale])
  }
}
