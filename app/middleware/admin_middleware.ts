import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle({ auth }: HttpContext, next: NextFn) {
    const user = auth.user

    if (!user || user.role !== 'admin') {
      throw new Exception('Admin access is required.', {
        status: 403,
        code: 'ADMIN_ACCESS_REQUIRED',
      })
    }

    return next()
  }
}
