import CreditTransaction from '#models/credit_transaction'
import Game from '#models/game'
import type GameSession from '#models/game_session'
import type User from '#models/user'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class WalletService {
  async getBalance(user: User) {
    const row = await CreditTransaction.query()
      .where('user_id', user.id)
      .sum('amount as balance')
      .first()

    return Number(row?.$extras.balance ?? 0)
  }

  async getRecentTransactions(user: User, limit = 20) {
    return CreditTransaction.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')
      .limit(limit)
  }

  async reserveGameSessionCredits(session: GameSession, user: User) {
    if (session.hostUserId !== user.id) {
      throw new Exception('Game session was not found.', {
        status: 404,
        code: 'GAME_SESSION_NOT_FOUND',
      })
    }

    if (!session.lockedAt) {
      throw new Exception('Game session setup must be locked before reserving credits.', {
        status: 422,
        code: 'GAME_SESSION_NOT_LOCKED',
      })
    }

    if (session.status === 'payment_pending') {
      throw new Exception('Category payment must be completed before reserving credits.', {
        status: 422,
        code: 'CATEGORY_PAYMENT_REQUIRED',
      })
    }

    if (session.status !== 'ready') {
      throw new Exception('Game session is not ready for credit reservation.', {
        status: 409,
        code: 'GAME_SESSION_NOT_READY',
      })
    }

    if (session.creditReservationStatus === 'reserved') {
      return session
    }

    if (!session.selectedRoundCount) {
      throw new Exception('Selected round count is required before reserving credits.', {
        status: 422,
        code: 'SESSION_SETTINGS_INCOMPLETE',
      })
    }

    const game = await Game.findOrFail(session.gameId)
    const requiredCredits = session.selectedRoundCount * game.baseRoundCreditCost
    const balance = await this.getBalance(user)

    if (balance < requiredCredits) {
      throw new Exception('Insufficient credits.', {
        status: 422,
        code: 'INSUFFICIENT_CREDITS',
      })
    }

    await db.transaction(async (trx) => {
      session.useTransaction(trx)

      await CreditTransaction.create(
        {
          userId: user.id,
          gameSessionId: session.id,
          type: 'reservation',
          amount: -requiredCredits,
          currency: 'round_credit',
          idempotencyKey: `game_session:${session.id}:credit_reservation`,
          description: `Reserved ${requiredCredits} credits for ${session.selectedRoundCount} rounds.`,
          metadata: {
            selectedRoundCount: session.selectedRoundCount,
            baseRoundCreditCost: game.baseRoundCreditCost,
          },
        },
        { client: trx }
      )

      session.creditReservationStatus = 'reserved'
      session.reservedCreditCount = requiredCredits
      session.creditsReservedAt = DateTime.utc()
      await session.save()
    })

    return session
  }
}
