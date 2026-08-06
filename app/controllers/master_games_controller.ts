import { apiSuccess } from '#http/api_response'
import Game from '#models/game'
import QuestionCategory from '#models/question_category'
import {
  serializeMasterGame,
  serializeMasterQuestionCategory,
  type MasterQuestionCategoryDto,
} from '#transformers/master_transformer'
import { showMasterGameValidator } from '#validators/master'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class MasterGamesController {
  async index({ request, response, i18n }: HttpContext) {
    const games = await Game.query()
      .where('status', 'published')
      .preload('translations', (query) => this.translationQuery(query, i18n.locale))
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    return response.ok(
      apiSuccess(
        {
          games: games
            .map((game) => {
              const translation = game.translations[0]
              return translation ? serializeMasterGame(game, translation) : null
            })
            .filter((game) => game !== null),
        },
        {
          code: 'MASTER_GAMES',
          message: 'Games retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async show({ request, response, i18n }: HttpContext) {
    const {
      params: { slug },
    } = await request.validateUsing(showMasterGameValidator)

    const game = await Game.query()
      .where('slug', slug)
      .where('status', 'published')
      .preload('translations', (query) => this.translationQuery(query, i18n.locale))
      .first()

    const translation = game?.translations[0]

    if (!game || !translation) {
      throw new Exception('Game was not found.', {
        status: 404,
        code: 'MASTER_GAME_NOT_FOUND',
      })
    }

    const categories = game.optionalCategoriesEnabled
      ? await this.getEnabledCategories(game.id, i18n.locale)
      : []

    return response.ok(
      apiSuccess(
        { game: serializeMasterGame(game, translation, categories) },
        {
          code: 'MASTER_GAME',
          message: 'Game retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  private translationQuery(
    query: {
      whereIn(columns: string, values: string[]): unknown
      orderByRaw(sql: string, bindings: string[]): unknown
    },
    locale: string
  ) {
    query.whereIn('locale', [locale, 'ar'])
    query.orderByRaw('CASE WHEN locale = ? THEN 0 ELSE 1 END', [locale])
  }

  private async getEnabledCategories(
    gameId: string,
    locale: string
  ): Promise<MasterQuestionCategoryDto[]> {
    const categories = await QuestionCategory.query()
      .where('game_id', gameId)
      .where('status', 'published')
      .preload('translations', (query) => this.translationQuery(query, locale))
      .orderBy('sort_order', 'asc')
      .orderBy('created_at', 'desc')

    return categories
      .map((category) => {
        const translation = category.translations[0]
        return translation ? serializeMasterQuestionCategory(category, translation) : null
      })
      .filter((category) => category !== null)
  }
}
