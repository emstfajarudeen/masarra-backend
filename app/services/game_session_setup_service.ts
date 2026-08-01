import Game from '#models/game'
import GameSession from '#models/game_session'
import GameSessionTeam from '#models/game_session_team'
import QuestionCategory from '#models/question_category'
import type User from '#models/user'
import {
  serializeMasterGame,
  serializeMasterQuestionCategory,
  type MasterQuestionCategoryDto,
} from '#transformers/master_transformer'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

interface TeamPayload {
  name: string
  color: string
}

export default class GameSessionSetupService {
  async create(host: User, gameSlug: string) {
    const game = await this.getPublishedGameBySlug(gameSlug)

    return GameSession.create({
      hostUserId: host.id,
      gameId: game.id,
      status: 'draft',
    })
  }

  async getOwnedSession(sessionId: string, host: User) {
    const session = await GameSession.query()
      .where('id', sessionId)
      .where('host_user_id', host.id)
      .preload('teams', (query) => query.orderBy('sort_order', 'asc'))
      .first()

    if (!session) {
      throw new Exception('Game session was not found.', {
        status: 404,
        code: 'GAME_SESSION_NOT_FOUND',
      })
    }

    return session
  }

  async updateTeams(session: GameSession, teams: TeamPayload[]) {
    this.ensureSessionEditable(session)

    const game = await Game.findOrFail(session.gameId)

    if (teams.length < game.minTeamCount || teams.length > game.maxTeamCount) {
      throw new Exception(
        `Team count must be between ${game.minTeamCount} and ${game.maxTeamCount}.`,
        {
          status: 422,
          code: 'INVALID_TEAM_COUNT',
        }
      )
    }

    this.ensureUniqueTeams(teams)

    await db.transaction(async (trx) => {
      await GameSessionTeam.query({ client: trx }).where('game_session_id', session.id).delete()

      await GameSessionTeam.createMany(
        teams.map((team, index) => ({
          gameSessionId: session.id,
          name: team.name,
          normalizedName: this.normalizeTeamName(team.name),
          color: team.color.toUpperCase(),
          sortOrder: index,
        })),
        { client: trx }
      )
    })

    await session.load('teams', (query) => query.orderBy('sort_order', 'asc'))
    return session
  }

  async updateSettings(session: GameSession, roundCount: number, questionDuration: number) {
    this.ensureSessionEditable(session)

    const game = await Game.findOrFail(session.gameId)

    if (!game.allowedRoundCounts.includes(roundCount)) {
      throw new Exception('Selected round count is not allowed for this game.', {
        status: 422,
        code: 'INVALID_ROUND_COUNT',
      })
    }

    if (!game.allowedQuestionDurations.includes(questionDuration)) {
      throw new Exception('Selected question duration is not allowed for this game.', {
        status: 422,
        code: 'INVALID_QUESTION_DURATION',
      })
    }

    session.selectedRoundCount = roundCount
    session.selectedQuestionDuration = questionDuration
    await session.save()

    return session
  }

  async selectOptionalCategory(session: GameSession, categorySlug: string | null) {
    this.ensureSessionEditable(session)

    if (categorySlug === null) {
      session.optionalQuestionCategoryId = null
      await session.save()
      return session
    }

    const game = await Game.findOrFail(session.gameId)

    if (!game.optionalCategoriesEnabled) {
      throw new Exception('Optional categories are disabled for this game.', {
        status: 422,
        code: 'OPTIONAL_CATEGORIES_DISABLED',
      })
    }

    const category = await QuestionCategory.query()
      .where('game_id', game.id)
      .where('slug', categorySlug)
      .where('status', 'published')
      .where('is_enabled', true)
      .first()

    if (!category) {
      throw new Exception('Question category was not found.', {
        status: 404,
        code: 'QUESTION_CATEGORY_NOT_FOUND',
      })
    }

    session.optionalQuestionCategoryId = category.id
    await session.save()

    return session
  }

  async lock(session: GameSession) {
    this.ensureSessionEditable(session)

    const game = await Game.findOrFail(session.gameId)
    await session.load('teams')

    if (session.teams.length < game.minTeamCount || session.teams.length > game.maxTeamCount) {
      throw new Exception('Teams must be completed before locking setup.', {
        status: 422,
        code: 'SESSION_TEAMS_INCOMPLETE',
      })
    }

    if (!session.selectedRoundCount || !session.selectedQuestionDuration) {
      throw new Exception('Game settings must be completed before locking setup.', {
        status: 422,
        code: 'SESSION_SETTINGS_INCOMPLETE',
      })
    }

    session.lockedAt = DateTime.utc()
    session.status = session.optionalQuestionCategoryId ? 'payment_pending' : 'ready'
    await session.save()

    return session
  }

  async getPresentation(session: GameSession, locale: string) {
    const game = await Game.query()
      .where('id', session.gameId)
      .preload('translations', (query) => this.translationQuery(query, locale))
      .firstOrFail()

    const gameTranslation = game.translations[0]

    if (!gameTranslation) {
      throw new Exception('Game translation was not found.', {
        status: 404,
        code: 'MASTER_GAME_NOT_FOUND',
      })
    }

    const categories = game.optionalCategoriesEnabled
      ? await this.getEnabledCategories(game.id, locale)
      : []

    const selectedCategory = session.optionalQuestionCategoryId
      ? await this.getSelectedCategory(session.optionalQuestionCategoryId, locale)
      : null

    return {
      game: serializeMasterGame(game, gameTranslation, categories),
      selectedCategory,
    }
  }

  private async getPublishedGameBySlug(slug: string) {
    const game = await Game.query().where('slug', slug).where('status', 'published').first()

    if (!game) {
      throw new Exception('Game was not found.', {
        status: 404,
        code: 'MASTER_GAME_NOT_FOUND',
      })
    }

    return game
  }

  private ensureSessionEditable(session: GameSession) {
    if (session.lockedAt || session.status !== 'draft') {
      throw new Exception('Game session setup is locked.', {
        status: 409,
        code: 'GAME_SESSION_LOCKED',
      })
    }
  }

  private ensureUniqueTeams(teams: TeamPayload[]) {
    const names = new Set<string>()
    const colors = new Set<string>()

    for (const team of teams) {
      const normalizedName = this.normalizeTeamName(team.name)
      const normalizedColor = team.color.toUpperCase()

      if (names.has(normalizedName)) {
        throw new Exception('Team names must be unique within the session.', {
          status: 422,
          code: 'DUPLICATE_TEAM_NAME',
        })
      }

      if (colors.has(normalizedColor)) {
        throw new Exception('Team colors must be unique within the session.', {
          status: 422,
          code: 'DUPLICATE_TEAM_COLOR',
        })
      }

      names.add(normalizedName)
      colors.add(normalizedColor)
    }
  }

  private normalizeTeamName(name: string) {
    return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
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
      .where('is_enabled', true)
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

  private async getSelectedCategory(
    categoryId: string,
    locale: string
  ): Promise<MasterQuestionCategoryDto | null> {
    const category = await QuestionCategory.query()
      .where('id', categoryId)
      .preload('translations', (query) => this.translationQuery(query, locale))
      .first()

    const translation = category?.translations[0]
    return category && translation ? serializeMasterQuestionCategory(category, translation) : null
  }
}
