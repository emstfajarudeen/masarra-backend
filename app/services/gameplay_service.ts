import CreditTransaction from '#models/credit_transaction'
import Game from '#models/game'
import GameSession from '#models/game_session'
import GameSessionRound from '#models/game_session_round'
import type User from '#models/user'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class GameplayService {
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

  async start(session: GameSession) {
    if (session.status === 'active') {
      return session
    }

    if (session.status !== 'ready' || session.creditReservationStatus !== 'reserved') {
      throw new Exception('Game session is not ready to start.', {
        status: 422,
        code: 'GAME_SESSION_NOT_STARTABLE',
      })
    }

    if (!session.selectedRoundCount) {
      throw new Exception('Selected round count is required before starting.', {
        status: 422,
        code: 'SESSION_SETTINGS_INCOMPLETE',
      })
    }

    await db.transaction(async (trx) => {
      session.useTransaction(trx)

      session.status = 'active'
      session.startedAt = DateTime.utc()
      session.currentRoundNumber = null
      await session.save()

      const existingRounds = await GameSessionRound.query({ client: trx })
        .where('game_session_id', session.id)
        .count('* as total')
        .first()

      if (Number(existingRounds?.$extras.total ?? 0) === 0) {
        await GameSessionRound.createMany(
          Array.from({ length: session.selectedRoundCount ?? 0 }, (_, index) => ({
            gameSessionId: session.id,
            roundNumber: index + 1,
            status: 'pending',
            creditOutcome: 'reserved',
          })),
          { client: trx }
        )
      }
    })

    await this.reloadGameplayRelations(session)
    return session
  }

  async startNextRound(session: GameSession) {
    this.ensureActiveSession(session)

    const activeRound = await GameSessionRound.query()
      .where('game_session_id', session.id)
      .where('status', 'active')
      .first()

    if (activeRound) {
      return activeRound
    }

    const nextRound = await GameSessionRound.query()
      .where('game_session_id', session.id)
      .where('status', 'pending')
      .orderBy('round_number', 'asc')
      .first()

    if (!nextRound) {
      session.status = 'completed'
      session.endedAt = DateTime.utc()
      session.currentRoundNumber = null
      session.creditReservationStatus = 'forfeited'
      await session.save()

      throw new Exception('All rounds are already completed.', {
        status: 409,
        code: 'NO_PENDING_ROUNDS',
      })
    }

    nextRound.status = 'active'
    nextRound.startedAt = DateTime.utc()
    await nextRound.save()

    session.currentRoundNumber = nextRound.roundNumber
    await session.save()

    return nextRound
  }

  async completeRound(
    session: GameSession,
    roundId: string,
    metadata: Record<string, unknown> = {}
  ) {
    this.ensureActiveSession(session)

    const round = await this.getSessionRound(session.id, roundId)

    if (round.status !== 'active') {
      throw new Exception('Round is not active.', {
        status: 409,
        code: 'ROUND_NOT_ACTIVE',
      })
    }

    round.status = 'completed'
    round.creditOutcome = 'charged'
    round.completedAt = DateTime.utc()
    round.metadata = metadata
    await round.save()

    session.completedRoundCount += 1
    session.currentRoundNumber = null

    if (session.completedRoundCount >= (session.selectedRoundCount ?? 0)) {
      session.status = 'completed'
      session.endedAt = DateTime.utc()
      session.creditReservationStatus = 'forfeited'
    }

    await session.save()
    await this.reloadGameplayRelations(session)

    return round
  }

  async abandonRound(session: GameSession, roundId: string, reason = 'user_cancelled') {
    this.ensureActiveSession(session)

    const round = await this.getSessionRound(session.id, roundId)

    if (round.status !== 'active') {
      throw new Exception('Round is not active.', {
        status: 409,
        code: 'ROUND_NOT_ACTIVE',
      })
    }

    if (reason === 'system_failure') {
      round.status = 'abandoned'
      round.creditOutcome = 'refunded'
      round.abandonedAt = DateTime.utc()
    } else {
      round.status = 'cancelled'
      round.creditOutcome = 'forfeited'
      round.cancelledAt = DateTime.utc()
    }

    round.metadata = { reason }
    await round.save()

    session.currentRoundNumber = null

    if (reason === 'system_failure') {
      await this.refundCredits(session, 1, `round:${round.id}:system_failure_refund`, {
        reason,
        roundId: round.id,
        roundNumber: round.roundNumber,
      })
    }

    await session.save()
    await this.reloadGameplayRelations(session)

    return round
  }

  async stop(session: GameSession, reason = 'host_stopped') {
    this.ensureActiveSession(session)

    const rounds = await GameSessionRound.query()
      .where('game_session_id', session.id)
      .orderBy('round_number', 'asc')

    const activeRounds = rounds.filter((round) => round.status === 'active')
    const pendingRounds = rounds.filter((round) => round.status === 'pending')

    for (const round of activeRounds) {
      round.status = 'cancelled'
      round.creditOutcome = 'forfeited'
      round.cancelledAt = DateTime.utc()
      round.metadata = { reason }
      await round.save()
    }

    for (const round of pendingRounds) {
      round.status = 'cancelled'
      round.creditOutcome = 'refunded'
      round.cancelledAt = DateTime.utc()
      round.metadata = { reason }
      await round.save()
    }

    if (pendingRounds.length > 0) {
      await this.refundCredits(
        session,
        pendingRounds.length,
        `game_session:${session.id}:host_stop_refund`,
        {
          reason,
          refundedRoundCount: pendingRounds.length,
        }
      )
    }

    session.status = 'cancelled'
    session.stoppedAt = DateTime.utc()
    session.endedAt = DateTime.utc()
    session.stopReason = reason
    session.currentRoundNumber = null
    session.creditReservationStatus = pendingRounds.length > 0 ? 'refunded' : 'forfeited'
    await session.save()

    await this.reloadGameplayRelations(session)
    return session
  }

  private ensureActiveSession(session: GameSession) {
    if (session.status !== 'active') {
      throw new Exception('Game session is not active.', {
        status: 409,
        code: 'GAME_SESSION_NOT_ACTIVE',
      })
    }
  }

  private async getSessionRound(sessionId: string, roundId: string) {
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

    return round
  }

  private async refundCredits(
    session: GameSession,
    creditCount: number,
    idempotencyKey: string,
    metadata: Record<string, unknown>
  ) {
    const game = await Game.findOrFail(session.gameId)
    const amount = creditCount * game.baseRoundCreditCost
    const existingRefund = await CreditTransaction.findBy('idempotencyKey', idempotencyKey)

    if (existingRefund || amount <= 0) {
      return
    }

    await CreditTransaction.create({
      userId: session.hostUserId,
      gameSessionId: session.id,
      type: 'refund',
      amount,
      currency: 'round_credit',
      idempotencyKey,
      description: `Refunded ${amount} credits for unplayed rounds.`,
      metadata,
    })

    session.refundedCreditCount += amount
  }

  private async reloadGameplayRelations(session: GameSession) {
    await session.load('teams', (query) => query.orderBy('sort_order', 'asc'))
    await session.load('rounds', (query) => query.orderBy('round_number', 'asc'))
  }
}
