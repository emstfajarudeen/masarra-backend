import { apiSuccess } from '#http/api_response'
import Game from '#models/game'
import Question from '#models/question'
import QuestionCategory from '#models/question_category'
import QuestionTranslation from '#models/question_translation'
import { serializeAdminQuestion } from '#transformers/admin_cms_transformer'
import {
  adminIdParamsValidator,
  adminQuestionListValidator,
  upsertAdminQuestionValidator,
} from '#validators/admin_cms'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

interface QuestionTranslationPayload {
  locale: 'ar' | 'en'
  prompt: string
  correctAnswer?: string | null
  explanation?: string | null
  metadata?: Record<string, unknown>
}

export default class AdminQuestionsController {
  async index({ request, response }: HttpContext) {
    const payload = await request.validateUsing(adminQuestionListValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    const query = Question.query()
      .preload('translations')
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    if (payload.gameId) {
      query.where('game_id', payload.gameId)
    }

    if (payload.categoryId !== undefined) {
      payload.categoryId === null
        ? query.whereNull('question_category_id')
        : query.where('question_category_id', payload.categoryId)
    }

    if (payload.status) {
      query.where('status', payload.status)
    }

    const paginator = await query.paginate(page, limit)

    return response.ok(
      apiSuccess(
        {
          questions: paginator.all().map(serializeAdminQuestion),
          pagination: paginator.getMeta(),
        },
        {
          code: 'ADMIN_QUESTIONS',
          message: 'Admin questions retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(upsertAdminQuestionValidator)

    this.assertUniqueLocales(payload.translations)

    const question = await db.transaction(async (trx) => {
      await this.assertGameExists(payload.gameId, trx)
      await this.assertCategoryBelongsToGame(
        payload.questionCategoryId ?? null,
        payload.gameId,
        trx
      )

      const record = new Question()
      record.useTransaction(trx)
      record.fill({
        gameId: payload.gameId,
        questionCategoryId: payload.questionCategoryId ?? null,
        status: payload.status,
        type: payload.type,
        basePoints: payload.basePoints,
        sortOrder: payload.sortOrder ?? 0,
        metadata: payload.metadata ?? {},
        publishedAt: this.publishedAtFor(payload.status),
      })
      await record.save()
      await this.syncTranslations(record.id, payload.translations, trx)

      return this.findOrFail(record.id, trx)
    })

    return response.created(
      apiSuccess(
        { question: serializeAdminQuestion(question) },
        {
          code: 'ADMIN_QUESTION_CREATED',
          message: 'Question created.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async show({ request, response }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminIdParamsValidator)

    const question = await this.findOrFail(id)

    return response.ok(
      apiSuccess(
        { question: serializeAdminQuestion(question) },
        {
          code: 'ADMIN_QUESTION',
          message: 'Question retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(upsertAdminQuestionValidator)
    const id = payload.params?.id

    if (!id) {
      throw new Exception('Question id is required.', { status: 400, code: 'QUESTION_ID_REQUIRED' })
    }

    this.assertUniqueLocales(payload.translations)

    const question = await db.transaction(async (trx) => {
      await this.assertGameExists(payload.gameId, trx)
      await this.assertCategoryBelongsToGame(
        payload.questionCategoryId ?? null,
        payload.gameId,
        trx
      )

      const record = await Question.query({ client: trx }).where('id', id).first()
      if (!record) {
        throw new Exception('Question was not found.', {
          status: 404,
          code: 'ADMIN_QUESTION_NOT_FOUND',
        })
      }

      record.useTransaction(trx)
      record.merge({
        gameId: payload.gameId,
        questionCategoryId: payload.questionCategoryId ?? null,
        status: payload.status,
        type: payload.type,
        basePoints: payload.basePoints,
        sortOrder: payload.sortOrder ?? 0,
        metadata: payload.metadata ?? {},
        publishedAt: this.publishedAtFor(payload.status, record.publishedAt),
      })
      await record.save()
      await this.syncTranslations(record.id, payload.translations, trx)

      return this.findOrFail(record.id, trx)
    })

    return response.ok(
      apiSuccess(
        { question: serializeAdminQuestion(question) },
        {
          code: 'ADMIN_QUESTION_UPDATED',
          message: 'Question updated.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private async findOrFail(id: string, client?: TransactionClientContract) {
    const question = await Question.query(client ? { client } : {})
      .where('id', id)
      .preload('translations')
      .first()

    if (!question) {
      throw new Exception('Question was not found.', {
        status: 404,
        code: 'ADMIN_QUESTION_NOT_FOUND',
      })
    }

    return question
  }

  private async syncTranslations(
    questionId: string,
    translations: QuestionTranslationPayload[],
    client: TransactionClientContract
  ) {
    const incomingLocales = translations.map((translation) => translation.locale)

    await QuestionTranslation.query({ client })
      .where('question_id', questionId)
      .whereNotIn('locale', incomingLocales)
      .delete()

    for (const translation of translations) {
      const record =
        (await QuestionTranslation.query({ client })
          .where('question_id', questionId)
          .where('locale', translation.locale)
          .first()) ?? new QuestionTranslation()

      record.useTransaction(client)
      record.merge({
        questionId,
        locale: translation.locale,
        prompt: translation.prompt,
        correctAnswer: translation.correctAnswer ?? null,
        explanation: translation.explanation ?? null,
        metadata: translation.metadata ?? {},
      })
      await record.save()
    }
  }

  private async assertGameExists(gameId: string, client: TransactionClientContract) {
    const game = await Game.query({ client }).where('id', gameId).first()

    if (!game) {
      throw new Exception('Game was not found.', { status: 404, code: 'ADMIN_GAME_NOT_FOUND' })
    }
  }

  private async assertCategoryBelongsToGame(
    questionCategoryId: string | null,
    gameId: string,
    client: TransactionClientContract
  ) {
    if (!questionCategoryId) {
      return
    }

    const category = await QuestionCategory.query({ client })
      .where('id', questionCategoryId)
      .where('game_id', gameId)
      .first()

    if (!category) {
      throw new Exception('Question category does not belong to this game.', {
        status: 422,
        code: 'QUESTION_CATEGORY_GAME_MISMATCH',
      })
    }
  }

  private assertUniqueLocales(translations: QuestionTranslationPayload[]) {
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
