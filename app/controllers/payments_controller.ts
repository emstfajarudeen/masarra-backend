import { apiSuccess } from '#http/api_response'
import PaymentService from '#services/payment_service'
import { serializePayment } from '#transformers/payment_transformer'
import { confirmPaymentValidator } from '#validators/payment'
import type User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class PaymentsController {
  async confirm({ request, response, auth }: HttpContext) {
    const {
      params: { id },
      providerReference,
    } = await request.validateUsing(confirmPaymentValidator)
    const user = auth.getUserOrFail() as User
    const payment = await new PaymentService().confirm(id, user, providerReference)

    return response.ok(
      apiSuccess(
        { payment: serializePayment(payment) },
        {
          code: 'PAYMENT_CONFIRMED',
          message: 'Payment confirmed.',
          meta: { requestId: request.id() },
        }
      )
    )
  }
}
