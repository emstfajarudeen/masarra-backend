import { apiSuccess } from '#http/api_response'
import ContentPage from '#models/content_page'
import ContentPageTranslation from '#models/content_page_translation'
import { serializeAdminContentPage } from '#transformers/admin_cms_transformer'
import {
  adminIdParamsValidator,
  adminListValidator,
  upsertAdminContentPageValidator,
} from '#validators/admin_cms'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

interface ContentPageTranslationPayload {
  locale: 'ar' | 'en'
  title: string
  excerpt?: string | null
  body: string
  metadata?: Record<string, unknown>
}

export default class AdminContentPagesController {
  async index({ request, response }: HttpContext) {
    const payload = await request.validateUsing(adminListValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    const query = ContentPage.query()
      .preload('translations')
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    if (payload.status) {
      query.where('status', payload.status)
    }

    if (payload.search) {
      query.where('slug', 'ILIKE', `%${payload.search}%`)
    }

    const paginator = await query.paginate(page, limit)

    return response.ok(
      apiSuccess(
        {
          pages: paginator.all().map(serializeAdminContentPage),
          pagination: paginator.getMeta(),
        },
        {
          code: 'ADMIN_CONTENT_PAGES',
          message: 'Admin content pages retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(upsertAdminContentPageValidator)

    this.assertUniqueLocales(payload.translations)

    const page = await db.transaction(async (trx) => {
      await this.assertSlugIsAvailable(payload.slug)

      const record = new ContentPage()
      record.useTransaction(trx)
      record.fill({
        slug: payload.slug,
        status: payload.status,
        sortOrder: payload.sortOrder ?? 0,
        publishedAt: this.publishedAtFor(payload.status),
      })
      await record.save()
      await this.syncTranslations(record.id, payload.translations, trx)

      return this.findOrFail(record.id, trx)
    })

    return response.created(
      apiSuccess(
        { page: serializeAdminContentPage(page) },
        {
          code: 'ADMIN_CONTENT_PAGE_CREATED',
          message: 'Content page created.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async show({ request, response }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminIdParamsValidator)

    const page = await this.findOrFail(id)

    return response.ok(
      apiSuccess(
        { page: serializeAdminContentPage(page) },
        {
          code: 'ADMIN_CONTENT_PAGE',
          message: 'Content page retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(upsertAdminContentPageValidator)
    const id = payload.params?.id

    if (!id) {
      throw new Exception('Content page id is required.', {
        status: 400,
        code: 'CONTENT_PAGE_ID_REQUIRED',
      })
    }

    this.assertUniqueLocales(payload.translations)

    const page = await db.transaction(async (trx) => {
      await this.assertSlugIsAvailable(payload.slug, id)

      const record = await ContentPage.query({ client: trx }).where('id', id).first()
      if (!record) {
        throw new Exception('Content page was not found.', {
          status: 404,
          code: 'ADMIN_CONTENT_PAGE_NOT_FOUND',
        })
      }

      record.useTransaction(trx)
      record.merge({
        slug: payload.slug,
        status: payload.status,
        sortOrder: payload.sortOrder ?? 0,
        publishedAt: this.publishedAtFor(payload.status, record.publishedAt),
      })
      await record.save()
      await this.syncTranslations(record.id, payload.translations, trx)

      return this.findOrFail(record.id, trx)
    })

    return response.ok(
      apiSuccess(
        { page: serializeAdminContentPage(page) },
        {
          code: 'ADMIN_CONTENT_PAGE_UPDATED',
          message: 'Content page updated.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private async findOrFail(id: string, client?: TransactionClientContract) {
    const page = await ContentPage.query(client ? { client } : {})
      .where('id', id)
      .preload('translations')
      .first()

    if (!page) {
      throw new Exception('Content page was not found.', {
        status: 404,
        code: 'ADMIN_CONTENT_PAGE_NOT_FOUND',
      })
    }

    return page
  }

  private async syncTranslations(
    contentPageId: string,
    translations: ContentPageTranslationPayload[],
    client: TransactionClientContract
  ) {
    const incomingLocales = translations.map((translation) => translation.locale)

    await ContentPageTranslation.query({ client })
      .where('content_page_id', contentPageId)
      .whereNotIn('locale', incomingLocales)
      .delete()

    for (const translation of translations) {
      const record =
        (await ContentPageTranslation.query({ client })
          .where('content_page_id', contentPageId)
          .where('locale', translation.locale)
          .first()) ?? new ContentPageTranslation()

      record.useTransaction(client)
      record.merge({
        contentPageId,
        locale: translation.locale,
        title: translation.title,
        excerpt: translation.excerpt ?? null,
        body: translation.body,
        metadata: translation.metadata ?? {},
      })
      await record.save()
    }
  }

  private async assertSlugIsAvailable(slug: string, ignoredPageId?: string) {
    const query = ContentPage.query().where('slug', slug)

    if (ignoredPageId) {
      query.whereNot('id', ignoredPageId)
    }

    const existing = await query.first()

    if (existing) {
      throw new Exception('Content page slug is already used.', {
        status: 409,
        code: 'CONTENT_PAGE_SLUG_TAKEN',
      })
    }
  }

  private assertUniqueLocales(translations: ContentPageTranslationPayload[]) {
    const locales = new Set(translations.map((translation) => translation.locale))
    if (locales.size !== translations.length) {
      throw new Exception('Translation locales must be unique.', {
        status: 422,
        code: 'DUPLICATE_TRANSLATION_LOCALE',
      })
    }
  }

  private publishedAtFor(status: string, current: DateTime | null = null) {
    if (status !== 'published') {
      return null
    }

    return current ?? DateTime.utc()
  }
}
