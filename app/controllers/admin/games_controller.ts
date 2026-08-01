import { apiSuccess } from '#http/api_response'
import Game from '#models/game'
import GameTranslation from '#models/game_translation'
import { serializeAdminGame } from '#transformers/admin_cms_transformer'
import {
  adminIdParamsValidator,
  adminListValidator,
  upsertAdminGameValidator,
} from '#validators/admin_cms'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'

interface GameTranslationPayload {
  locale: 'ar' | 'en'
  title: string
  description?: string | null
  instructions?: string | null
  metadata?: Record<string, unknown>
}

export default class AdminGamesController {
  async index({ request, response }: HttpContext) {
    const payload = await request.validateUsing(adminListValidator)
    const page = payload.page ?? 1
    const limit = payload.limit ?? 20

    const query = Game.query()
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
          games: paginator.all().map(serializeAdminGame),
          pagination: paginator.getMeta(),
        },
        {
          code: 'ADMIN_GAMES',
          message: 'Admin games retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(upsertAdminGameValidator)

    this.assertTeamBounds(payload.minTeamCount, payload.maxTeamCount)
    this.assertUniqueLocales(payload.translations)

    const game = await db.transaction(async (trx) => {
      await this.assertSlugIsAvailable(payload.slug)

      const record = new Game()
      record.useTransaction(trx)
      record.fill({
        slug: payload.slug,
        status: payload.status,
        minTeamCount: payload.minTeamCount,
        maxTeamCount: payload.maxTeamCount,
        allowedRoundCounts: payload.allowedRoundCounts,
        allowedQuestionDurations: payload.allowedQuestionDurations,
        baseRoundCreditCost: payload.baseRoundCreditCost,
        optionalCategoriesEnabled: payload.optionalCategoriesEnabled,
        sortOrder: payload.sortOrder ?? 0,
        publishedAt: this.publishedAtFor(payload.status),
      })
      await record.save()
      await this.syncTranslations(record.id, payload.translations, trx)

      return this.findOrFail(record.id, trx)
    })

    return response.created(
      apiSuccess(
        { game: serializeAdminGame(game) },
        {
          code: 'ADMIN_GAME_CREATED',
          message: 'Game created.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async show({ request, response }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(adminIdParamsValidator)

    const game = await this.findOrFail(id)

    return response.ok(
      apiSuccess(
        { game: serializeAdminGame(game) },
        {
          code: 'ADMIN_GAME',
          message: 'Game retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async update({ request, response }: HttpContext) {
    const payload = await request.validateUsing(upsertAdminGameValidator)
    const id = payload.params?.id

    if (!id) {
      throw new Exception('Game id is required.', { status: 400, code: 'GAME_ID_REQUIRED' })
    }

    this.assertTeamBounds(payload.minTeamCount, payload.maxTeamCount)
    this.assertUniqueLocales(payload.translations)

    const game = await db.transaction(async (trx) => {
      await this.assertSlugIsAvailable(payload.slug, id)

      const record = await Game.query({ client: trx }).where('id', id).first()
      if (!record) {
        throw new Exception('Game was not found.', { status: 404, code: 'ADMIN_GAME_NOT_FOUND' })
      }

      record.useTransaction(trx)
      record.merge({
        slug: payload.slug,
        status: payload.status,
        minTeamCount: payload.minTeamCount,
        maxTeamCount: payload.maxTeamCount,
        allowedRoundCounts: payload.allowedRoundCounts,
        allowedQuestionDurations: payload.allowedQuestionDurations,
        baseRoundCreditCost: payload.baseRoundCreditCost,
        optionalCategoriesEnabled: payload.optionalCategoriesEnabled,
        sortOrder: payload.sortOrder ?? 0,
        publishedAt: this.publishedAtFor(payload.status, record.publishedAt),
      })
      await record.save()
      await this.syncTranslations(record.id, payload.translations, trx)

      return this.findOrFail(record.id, trx)
    })

    return response.ok(
      apiSuccess(
        { game: serializeAdminGame(game) },
        {
          code: 'ADMIN_GAME_UPDATED',
          message: 'Game updated.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private async findOrFail(id: string, client?: TransactionClientContract) {
    const game = await Game.query(client ? { client } : {})
      .where('id', id)
      .preload('translations')
      .first()

    if (!game) {
      throw new Exception('Game was not found.', { status: 404, code: 'ADMIN_GAME_NOT_FOUND' })
    }

    return game
  }

  private async syncTranslations(
    gameId: string,
    translations: GameTranslationPayload[],
    client: TransactionClientContract
  ) {
    const incomingLocales = translations.map((translation) => translation.locale)

    await GameTranslation.query({ client })
      .where('game_id', gameId)
      .whereNotIn('locale', incomingLocales)
      .delete()

    for (const translation of translations) {
      const record =
        (await GameTranslation.query({ client })
          .where('game_id', gameId)
          .where('locale', translation.locale)
          .first()) ?? new GameTranslation()

      record.useTransaction(client)
      record.merge({
        gameId,
        locale: translation.locale,
        title: translation.title,
        description: translation.description ?? null,
        instructions: translation.instructions ?? null,
        metadata: translation.metadata ?? {},
      })
      await record.save()
    }
  }

  private async assertSlugIsAvailable(slug: string, ignoredGameId?: string) {
    const query = Game.query().where('slug', slug)

    if (ignoredGameId) {
      query.whereNot('id', ignoredGameId)
    }

    const existing = await query.first()

    if (existing) {
      throw new Exception('Game slug is already used.', { status: 409, code: 'GAME_SLUG_TAKEN' })
    }
  }

  private assertTeamBounds(minTeamCount: number, maxTeamCount: number) {
    if (minTeamCount > maxTeamCount) {
      throw new Exception('Minimum team count cannot exceed maximum team count.', {
        status: 422,
        code: 'INVALID_TEAM_LIMITS',
      })
    }
  }

  private assertUniqueLocales(translations: GameTranslationPayload[]) {
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
