import { apiSuccess } from '#http/api_response'
import GameSessionSetupService from '#services/game_session_setup_service'
import { serializeGameSession } from '#transformers/game_session_transformer'
import {
  createGameSessionValidator,
  gameSessionParamsValidator,
  selectOptionalCategoryValidator,
  updateGameSessionSettingsValidator,
  updateGameSessionTeamsValidator,
} from '#validators/game_session'
import type User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class GameSessionsController {
  private service = new GameSessionSetupService()

  async store({ request, response, auth, i18n }: HttpContext) {
    const payload = await request.validateUsing(createGameSessionValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.service.create(user, payload.gameSlug)
    await session.load('teams')

    const presentation = await this.service.getPresentation(session, i18n.locale)

    return response.created(
      apiSuccess(
        {
          session: serializeGameSession(
            session,
            presentation.game,
            presentation.selectedCategory,
            session.teams
          ),
        },
        {
          code: 'GAME_SESSION_CREATED',
          message: 'Game session created.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async show({ request, response, auth, i18n }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(gameSessionParamsValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.service.getOwnedSession(id, user)
    const presentation = await this.service.getPresentation(session, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          session: serializeGameSession(
            session,
            presentation.game,
            presentation.selectedCategory,
            session.teams
          ),
        },
        {
          code: 'GAME_SESSION_SETUP',
          message: 'Game session setup retrieved.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async updateTeams({ request, response, auth, i18n }: HttpContext) {
    const payload = await request.validateUsing(updateGameSessionTeamsValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.service.getOwnedSession(payload.params.id, user)
    const updatedSession = await this.service.updateTeams(session, payload.teams)
    const presentation = await this.service.getPresentation(updatedSession, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          session: serializeGameSession(
            updatedSession,
            presentation.game,
            presentation.selectedCategory,
            updatedSession.teams
          ),
        },
        {
          code: 'GAME_SESSION_TEAMS_UPDATED',
          message: 'Game session teams updated.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async updateSettings({ request, response, auth, i18n }: HttpContext) {
    const payload = await request.validateUsing(updateGameSessionSettingsValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.service.getOwnedSession(payload.params.id, user)
    const updatedSession = await this.service.updateSettings(
      session,
      payload.roundCount,
      payload.questionDuration
    )
    const presentation = await this.service.getPresentation(updatedSession, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          session: serializeGameSession(
            updatedSession,
            presentation.game,
            presentation.selectedCategory,
            updatedSession.teams
          ),
        },
        {
          code: 'GAME_SESSION_SETTINGS_UPDATED',
          message: 'Game session settings updated.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async selectOptionalCategory({ request, response, auth, i18n }: HttpContext) {
    const payload = await request.validateUsing(selectOptionalCategoryValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.service.getOwnedSession(payload.params.id, user)
    const updatedSession = await this.service.selectOptionalCategory(session, payload.categorySlug)
    const presentation = await this.service.getPresentation(updatedSession, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          session: serializeGameSession(
            updatedSession,
            presentation.game,
            presentation.selectedCategory,
            updatedSession.teams
          ),
        },
        {
          code: 'GAME_SESSION_CATEGORY_UPDATED',
          message: 'Game session optional category updated.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async lock({ request, response, auth, i18n }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(gameSessionParamsValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.service.getOwnedSession(id, user)
    const lockedSession = await this.service.lock(session)
    const presentation = await this.service.getPresentation(lockedSession, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          session: serializeGameSession(
            lockedSession,
            presentation.game,
            presentation.selectedCategory,
            lockedSession.teams
          ),
        },
        {
          code: 'GAME_SESSION_LOCKED',
          message: 'Game session setup locked.',
          meta: { requestId: request.id() },
        }
      )
    )
  }
}
