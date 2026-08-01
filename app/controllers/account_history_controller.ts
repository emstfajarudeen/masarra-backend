import { apiSuccess } from '#http/api_response'
import CreditTransaction from '#models/credit_transaction'
import GameSession from '#models/game_session'
import Payment from '#models/payment'
import {
  serializeAccountCreditTransactionItem,
  serializeAccountGameHistoryDetail,
  serializeAccountGameHistoryItem,
  serializeAccountPaymentHistoryItem,
} from '#transformers/account_history_transformer'
import {
  accountCreditTransactionListValidator,
  accountHistoryListValidator,
  accountHistorySessionParamsValidator,
  accountPaymentHistoryListValidator,
} from '#validators/account_history'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class AccountHistoryController {
  async gameHistory({ request, response, auth, i18n }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(accountHistoryListValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    const query = this.baseGameHistoryQuery(user.id, i18n.locale)

    if (payload.status) {
      query.where('status', payload.status)
    }

    const paginator = await query.paginate(page, limit)

    return response.ok(
      apiSuccess(
        {
          sessions: paginator.all().map(serializeAccountGameHistoryItem),
          pagination: paginator.getMeta(),
        },
        {
          code: 'ACCOUNT_GAME_HISTORY',
          message: 'Game history retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async gameHistoryShow({ request, response, auth, i18n }: HttpContext) {
    const user = auth.getUserOrFail()
    const {
      params: { id },
    } = await request.validateUsing(accountHistorySessionParamsValidator)

    const session = await this.baseGameHistoryQuery(user.id, i18n.locale)
      .where('id', id)
      .preload('rounds', (query) => query.orderBy('round_number', 'asc'))
      .first()

    if (!session) {
      throw new Exception('Game session was not found.', {
        status: 404,
        code: 'ACCOUNT_GAME_HISTORY_NOT_FOUND',
      })
    }

    return response.ok(
      apiSuccess(
        { session: serializeAccountGameHistoryDetail(session) },
        {
          code: 'ACCOUNT_GAME_HISTORY_DETAIL',
          message: 'Game history detail retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async purchasedHistory({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(accountPaymentHistoryListValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    const query = Payment.query().where('user_id', user.id).orderBy('created_at', 'desc')

    if (payload.status) {
      query.where('status', payload.status)
    }

    const paginator = await query.paginate(page, limit)

    return response.ok(
      apiSuccess(
        {
          payments: paginator.all().map(serializeAccountPaymentHistoryItem),
          pagination: paginator.getMeta(),
        },
        {
          code: 'ACCOUNT_PURCHASED_HISTORY',
          message: 'Purchased history retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async creditTransactions({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(accountCreditTransactionListValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    const query = CreditTransaction.query().where('user_id', user.id).orderBy('created_at', 'desc')

    if (payload.type) {
      query.where('type', payload.type)
    }

    const paginator = await query.paginate(page, limit)

    return response.ok(
      apiSuccess(
        {
          transactions: paginator.all().map(serializeAccountCreditTransactionItem),
          pagination: paginator.getMeta(),
        },
        {
          code: 'ACCOUNT_CREDIT_TRANSACTIONS',
          message: 'Credit transaction history retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private baseGameHistoryQuery(userId: string, locale: string) {
    return GameSession.query()
      .where('host_user_id', userId)
      .whereNot('status', 'draft')
      .preload('game', (gameQuery) => {
        gameQuery.preload('translations', (translationQuery) => {
          translationQuery
            .whereIn('locale', [locale, 'ar'])
            .orderByRaw('CASE WHEN locale = ? THEN 0 ELSE 1 END', [locale])
        })
      })
      .preload('optionalQuestionCategory', (categoryQuery) => {
        categoryQuery.preload('translations', (translationQuery) => {
          translationQuery
            .whereIn('locale', [locale, 'ar'])
            .orderByRaw('CASE WHEN locale = ? THEN 0 ELSE 1 END', [locale])
        })
      })
      .preload('teams', (teamQuery) => {
        teamQuery.orderBy('sort_order', 'asc')
      })
      .orderBy('created_at', 'desc')
  }
}
