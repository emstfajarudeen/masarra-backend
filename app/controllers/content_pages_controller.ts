import { apiSuccess } from '#http/api_response'
import ContentPage from '#models/content_page'
import { serializeContentPage } from '#transformers/content_page_transformer'
import { showContentPageValidator } from '#validators/content_page'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class ContentPagesController {
  async show({ request, response, i18n }: HttpContext) {
    const {
      params: { slug },
    } = await request.validateUsing(showContentPageValidator)

    const page = await ContentPage.query()
      .where('slug', slug)
      .where('status', 'published')
      .preload('translations', (query) => {
        query
          .whereIn('locale', [i18n.locale, 'ar'])
          .orderByRaw('CASE WHEN locale = ? THEN 0 ELSE 1 END', [i18n.locale])
      })
      .first()

    const translation = page?.translations[0]

    if (!page || !translation) {
      throw new Exception('Content page was not found.', {
        status: 404,
        code: 'CONTENT_PAGE_NOT_FOUND',
      })
    }

    return response.ok(
      apiSuccess(serializeContentPage(page, translation), {
        code: 'CONTENT_PAGE',
        message: 'Content page retrieved.',
        meta: { requestId: request.id() },
      })
    )
  }
}
