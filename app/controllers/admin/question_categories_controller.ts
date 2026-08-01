import { apiSuccess } from '#http/api_response'
import Game from '#models/game'
import QuestionCategory from '#models/question_category'
import QuestionCategoryTranslation from '#models/question_category_translation'
import { serializeAdminQuestionCategory } from '#transformers/admin_cms_transformer'
import {
  adminGameIdParamsValidator,
  adminIdParamsValidator,
  adminListValidator,
  upsertAdminQuestionCategoryValidator,
} from '#validators/admin_cms'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

interface CategoryTranslationPayload {
  locale: 'ar' | 'en'
  title: string
  description?: string | null
  metadata?: Record<string, unknown>
}

export default class AdminQuestionCategoriesController {
  async index({ request, response }: HttpContext) {
    const {
      params: { gameId },
    } = await request.validateUsing(adminGameIdParamsValidator)
    const payload = await request.validateUsing(adminListValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    await this.assertGameExists(gameId)

    const query = QuestionCategory.query()
      .where('game_id', gameId)
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
          categories: paginator.all().map(serializeAdminQuestionCategory),
          pagination: paginator.getMeta(),
        },
        {
          code: 'ADMIN_QUESTION_CATEGORIES',
          message: 'Admin question categories retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(upsertAdminQuestionCategoryValidator)
    const gameId = payload.params.gameId

    if (!gameId) {
      throw new Exception('Game id is required.', { status: 400, code: 'GAME_ID_REQUIRED' })
    }

    this.assertUniqueLocales(payload.translations)

    const category = await db.transaction(async (trx) => {
      await this.assertGameExists(gameId, trx)
      await this.assertSlugIsAvailable(gameId, payload.slug)

      const record = new QuestionCategory()
      record.useTransaction(trx)
      record.fill({
        gameId,
        slug: payload.slug,
        status: payload.status,
        isEnabled: payload.isEnabled,
        priceAmount: payload.priceAmount ?? null,
        priceCurrency: payload.priceCurrency ?? 'KWD',
        sortOrder: payload.sortOrder ?? 0,
        publishedAt: this.publishedAtFor(payload.status),
      })
      await record.save()
      await this.syncTranslations(record.id, payload.translations, trx)

      return this.findOrFail(record.id, trx)
    })

    return response.created(
      apiSuccess(
        { category: serializeAdminQuestionCategory(category) },
        {
          code: 'ADMIN_QUESTION_CATEGORY_CREATED',
          message: 'Question category created.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(upsertAdminQuestionCategoryValidator)
    const id = payload.params.id

    if (!id) {
      throw new Exception('Category id is required.', { status: 400, code: 'CATEGORY_ID_REQUIRED' })
    }

    this.assertUniqueLocales(payload.translations)

    const category = await db.transaction(async (trx) => {
      const record = await QuestionCategory.query({ client: trx }).where('id', id).first()
      if (!record) {
        throw new Exception('Question category was not found.', {
          status: 404,
          code: 'ADMIN_QUESTION_CATEGORY_NOT_FOUND',
        })
      }

      await this.assertSlugIsAvailable(record.gameId, payload.slug, id)

      record.useTransaction(trx)
      record.merge({
        slug: payload.slug,
        status: payload.status,
        isEnabled: payload.isEnabled,
        priceAmount: payload.priceAmount ?? null,
        priceCurrency: payload.priceCurrency ?? 'KWD',
        sortOrder: payload.sortOrder ?? 0,
        publishedAt: this.publishedAtFor(payload.status, record.publishedAt),
      })
      await record.save()
      await this.syncTranslations(record.id, payload.translations, trx)

      return this.findOrFail(record.id, trx)
    })

    return response.ok(
      apiSuccess(
        { category: serializeAdminQuestionCategory(category) },
        {
          code: 'ADMIN_QUESTION_CATEGORY_UPDATED',
          message: 'Question category updated.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async show({ request, response }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminIdParamsValidator)

    const category = await this.findOrFail(id)

    return response.ok(
      apiSuccess(
        { category: serializeAdminQuestionCategory(category) },
        {
          code: 'ADMIN_QUESTION_CATEGORY',
          message: 'Question category retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private async findOrFail(id: string, client?: TransactionClientContract) {
    const category = await QuestionCategory.query(client ? { client } : {})
      .where('id', id)
      .preload('translations')
      .first()

    if (!category) {
      throw new Exception('Question category was not found.', {
        status: 404,
        code: 'ADMIN_QUESTION_CATEGORY_NOT_FOUND',
      })
    }

    return category
  }

  private async syncTranslations(
    questionCategoryId: string,
    translations: CategoryTranslationPayload[],
    client: TransactionClientContract
  ) {
    const incomingLocales = translations.map((translation) => translation.locale)

    await QuestionCategoryTranslation.query({ client })
      .where('question_category_id', questionCategoryId)
      .whereNotIn('locale', incomingLocales)
      .delete()

    for (const translation of translations) {
      const record =
        (await QuestionCategoryTranslation.query({ client })
          .where('question_category_id', questionCategoryId)
          .where('locale', translation.locale)
          .first()) ?? new QuestionCategoryTranslation()

      record.useTransaction(client)
      record.merge({
        questionCategoryId,
        locale: translation.locale,
        title: translation.title,
        description: translation.description ?? null,
        metadata: translation.metadata ?? {},
      })
      await record.save()
    }
  }

  private async assertGameExists(gameId: string, client?: TransactionClientContract) {
    const game = await Game.query(client ? { client } : {})
      .where('id', gameId)
      .first()

    if (!game) {
      throw new Exception('Game was not found.', { status: 404, code: 'ADMIN_GAME_NOT_FOUND' })
    }
  }

  private async assertSlugIsAvailable(gameId: string, slug: string, ignoredCategoryId?: string) {
    const query = QuestionCategory.query().where('game_id', gameId).where('slug', slug)

    if (ignoredCategoryId) {
      query.whereNot('id', ignoredCategoryId)
    }

    const existing = await query.first()

    if (existing) {
      throw new Exception('Question category slug is already used for this game.', {
        status: 409,
        code: 'QUESTION_CATEGORY_SLUG_TAKEN',
      })
    }
  }

  private assertUniqueLocales(translations: CategoryTranslationPayload[]) {
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
