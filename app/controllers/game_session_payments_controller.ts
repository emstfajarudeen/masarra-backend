import { apiSuccess } from '#http/api_response'
import GameSessionSetupService from '#services/game_session_setup_service'
import PaymentService from '#services/payment_service'
import WalletService from '#services/wallet_service'
import { serializeGameSession } from '#transformers/game_session_transformer'
import { serializePayment } from '#transformers/payment_transformer'
import { reserveGameSessionCreditsValidator } from '#validators/credit_reservation'
import { createCategoryPaymentIntentValidator } from '#validators/payment'
import type User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class GameSessionPaymentsController {
  private setupService = new GameSessionSetupService()

  async createCategoryPaymentIntent({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createCategoryPaymentIntentValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.setupService.getOwnedSession(payload.params.id, user)
    const payment = await new PaymentService().createCategoryPaymentIntent(
      session,
      user,
      payload.method ?? 'direct'
    )

    return response.created(
      apiSuccess(
        { payment: serializePayment(payment) },
        {
          code: 'CATEGORY_PAYMENT_INTENT_CREATED',
          message: 'Category payment intent created.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async reserveCredits({ request, response, auth, i18n }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(reserveGameSessionCreditsValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.setupService.getOwnedSession(id, user)
    const updatedSession = await new WalletService().reserveGameSessionCredits(session, user)
    const presentation = await this.setupService.getPresentation(updatedSession, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          session: serializeGameSession(
            updatedSession,
            presentation.game,
            presentation.selectedCategory,
            updatedSession.teams
          ),
        },
        {
          code: 'GAME_SESSION_CREDITS_RESERVED',
          message: 'Game session credits reserved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }
}
