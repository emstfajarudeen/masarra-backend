import { apiSuccess } from '#http/api_response'
import WalletService from '#services/wallet_service'
import { serializeWallet } from '#transformers/wallet_transformer'
import type User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class WalletController {
  async show({ request, response, auth }: HttpContext) {
    const user = auth.getUserOrFail() as User
    const service = new WalletService()
    const [balance, transactions] = await Promise.all([
      service.getBalance(user),
      service.getRecentTransactions(user),
    ])

    return response.ok(
      apiSuccess(serializeWallet(balance, transactions), {
        code: 'WALLET',
        message: 'Wallet retrieved.',
        meta: { requestId: request.id() },
      })
    )
  }
}
