import { apiSuccess } from '#http/api_response'
import ContactMessage from '#models/contact_message'
import { submitContactMessageValidator } from '#validators/contact'
import type { HttpContext } from '@adonisjs/core/http'

export default class ContactMessagesController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(submitContactMessageValidator)

    const contactMessage = await ContactMessage.create({
      fullName: payload.fullName,
      email: payload.email,
      message: payload.message,
      status: 'new',
      ipAddress: request.ip(),
      userAgent: request.header('user-agent') ?? null,
    })

    return response.created(
      apiSuccess(
        { id: contactMessage.id },
        {
          code: 'CONTACT_MESSAGE_SUBMITTED',
          message: 'Contact message submitted.',
          meta: { requestId: request.id() },
        }
      )
    )
  }
}
