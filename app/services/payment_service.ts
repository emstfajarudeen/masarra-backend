import GameSession from '#models/game_session'
import Payment, { type PaymentMethod } from '#models/payment'
import QuestionCategory from '#models/question_category'
import type User from '#models/user'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class PaymentService {
  async createCategoryPaymentIntent(
    session: GameSession,
    user: User,
    method: PaymentMethod = 'direct'
  ) {
    if (session.hostUserId !== user.id) {
      throw new Exception('Game session was not found.', {
        status: 404,
        code: 'GAME_SESSION_NOT_FOUND',
      })
    }

    if (!session.lockedAt || session.status !== 'payment_pending') {
      throw new Exception('Category payment is not required for this session.', {
        status: 422,
        code: 'CATEGORY_PAYMENT_NOT_REQUIRED',
      })
    }

    if (!session.optionalQuestionCategoryId) {
      throw new Exception('No optional category is selected for this session.', {
        status: 422,
        code: 'OPTIONAL_CATEGORY_NOT_SELECTED',
      })
    }

    const idempotencyKey = `game_session:${session.id}:optional_category_payment`
    const existingPayment = await Payment.findBy('idempotencyKey', idempotencyKey)

    if (existingPayment) {
      return existingPayment
    }

    const category = await QuestionCategory.findOrFail(session.optionalQuestionCategoryId)

    const amount = category.priceAmount

    if (!amount || Number(amount) <= 0) {
      throw new Exception('Selected category does not require payment.', {
        status: 422,
        code: 'CATEGORY_PAYMENT_NOT_REQUIRED',
      })
    }

    let payment!: Payment

    await db.transaction(async (trx) => {
      session.useTransaction(trx)

      payment = await Payment.create(
        {
          userId: user.id,
          gameSessionId: session.id,
          payableType: 'optional_category',
          method,
          status: 'pending',
          amount,
          currency: category.priceCurrency,
          provider: null,
          providerReference: null,
          idempotencyKey,
          metadata: {
            optionalQuestionCategoryId: category.id,
            optionalQuestionCategorySlug: category.slug,
          },
          expiresAt: DateTime.utc().plus({ minutes: 30 }),
        },
        { client: trx }
      )

      session.categoryPaymentId = payment.id
      await session.save()
    })

    return payment
  }

  async confirm(paymentId: string, user: User, providerReference?: string) {
    const payment = await Payment.query().where('id', paymentId).where('user_id', user.id).first()

    if (!payment) {
      throw new Exception('Payment was not found.', {
        status: 404,
        code: 'PAYMENT_NOT_FOUND',
      })
    }

    if (payment.status === 'paid') {
      return payment
    }

    if (payment.status !== 'pending') {
      throw new Exception('Payment cannot be confirmed.', {
        status: 409,
        code: 'PAYMENT_NOT_CONFIRMABLE',
      })
    }

    await db.transaction(async (trx) => {
      payment.useTransaction(trx)

      payment.status = 'paid'
      payment.providerReference = providerReference ?? payment.providerReference
      payment.paidAt = DateTime.utc()
      await payment.save()

      if (payment.payableType === 'optional_category' && payment.gameSessionId) {
        const session = await GameSession.findOrFail(payment.gameSessionId, { client: trx })

        if (session.status === 'payment_pending') {
          session.status = 'ready'
          session.categoryPaymentId = payment.id
          await session.save()
        }
      }
    })

    return payment
  }
}
