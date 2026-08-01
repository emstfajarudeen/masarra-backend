import { apiSuccess } from '#http/api_response'
import ContactMessage from '#models/contact_message'
import { serializeAdminContactMessage } from '#transformers/admin_cms_transformer'
import {
  adminIdParamsValidator,
  adminListValidator,
  updateAdminContactMessageStatusValidator,
} from '#validators/admin_cms'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminContactMessagesController {
  async index({ request, response }: HttpContext) {
    const payload = await request.validateUsing(adminListValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    const query = ContactMessage.query().orderBy('created_at', 'desc')

    if (payload.status) {
      query.where('status', payload.status)
    }

    if (payload.search) {
      query.where((builder) => {
        builder
          .where('full_name', 'ILIKE', `%${payload.search}%`)
          .orWhere('email', 'ILIKE', `%${payload.search}%`)
      })
    }

    const paginator = await query.paginate(page, limit)

    return response.ok(
      apiSuccess(
        {
          messages: paginator.all().map(serializeAdminContactMessage),
          pagination: paginator.getMeta(),
        },
        {
          code: 'ADMIN_CONTACT_MESSAGES',
          message: 'Admin contact messages retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async show({ request, response }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminIdParamsValidator)

    const message = await this.findOrFail(id)

    return response.ok(
      apiSuccess(
        { message: serializeAdminContactMessage(message) },
        {
          code: 'ADMIN_CONTACT_MESSAGE',
          message: 'Admin contact message retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async updateStatus({ request, response }: HttpContext) {
    const payload = await request.validateUsing(updateAdminContactMessageStatusValidator)

    const message = await this.findOrFail(payload.params.id)
    message.merge({ status: payload.status })
    await message.save()

    return response.ok(
      apiSuccess(
        { message: serializeAdminContactMessage(message) },
        {
          code: 'ADMIN_CONTACT_MESSAGE_UPDATED',
          message: 'Contact message updated.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private async findOrFail(id: string) {
    const message = await ContactMessage.find(id)

    if (!message) {
      throw new Exception('Contact message was not found.', {
        status: 404,
        code: 'ADMIN_CONTACT_MESSAGE_NOT_FOUND',
      })
    }

    return message
  }
}
