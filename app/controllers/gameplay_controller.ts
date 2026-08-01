import { apiSuccess } from '#http/api_response'
import GameplayService from '#services/gameplay_service'
import GameSessionSetupService from '#services/game_session_setup_service'
import {
  serializeGameSession,
  serializeGameSessionRound,
} from '#transformers/game_session_transformer'
import {
  abandonRoundValidator,
  completeRoundValidator,
  gameplaySessionParamsValidator,
  stopGameSessionValidator,
} from '#validators/gameplay'
import type User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class GameplayController {
  private gameplay = new GameplayService()
  private setup = new GameSessionSetupService()

  async start({ request, response, auth, i18n }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(gameplaySessionParamsValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.gameplay.getOwnedSession(id, user)
    const startedSession = await this.gameplay.start(session)
    const presentation = await this.setup.getPresentation(startedSession, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          session: serializeGameSession(
            startedSession,
            presentation.game,
            presentation.selectedCategory,
            startedSession.teams,
            startedSession.rounds
          ),
        },
        {
          code: 'GAME_STARTED',
          message: 'Game started.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async startNextRound({ request, response, auth }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(gameplaySessionParamsValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.gameplay.getOwnedSession(id, user)
    const round = await this.gameplay.startNextRound(session)

    return response.ok(
      apiSuccess(
        { round: serializeGameSessionRound(round) },
        {
          code: 'ROUND_STARTED',
          message: 'Round started.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async completeRound({ request, response, auth, i18n }: HttpContext) {
    const payload = await request.validateUsing(completeRoundValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.gameplay.getOwnedSession(payload.params.id, user)
    const round = await this.gameplay.completeRound(
      session,
      payload.params.roundId,
      payload.metadata ?? {}
    )
    const presentation = await this.setup.getPresentation(session, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          round: serializeGameSessionRound(round),
          session: serializeGameSession(
            session,
            presentation.game,
            presentation.selectedCategory,
            session.teams,
            session.rounds
          ),
        },
        {
          code: 'ROUND_COMPLETED',
          message: 'Round completed.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async abandonRound({ request, response, auth, i18n }: HttpContext) {
    const payload = await request.validateUsing(abandonRoundValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.gameplay.getOwnedSession(payload.params.id, user)
    const round = await this.gameplay.abandonRound(
      session,
      payload.params.roundId,
      payload.reason ?? 'user_cancelled'
    )
    const presentation = await this.setup.getPresentation(session, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          round: serializeGameSessionRound(round),
          session: serializeGameSession(
            session,
            presentation.game,
            presentation.selectedCategory,
            session.teams,
            session.rounds
          ),
        },
        {
          code: 'ROUND_ABANDONED',
          message: 'Round abandoned.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async stop({ request, response, auth, i18n }: HttpContext) {
    const payload = await request.validateUsing(stopGameSessionValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.gameplay.getOwnedSession(payload.params.id, user)
    const stoppedSession = await this.gameplay.stop(session, payload.reason ?? 'host_stopped')
    const presentation = await this.setup.getPresentation(stoppedSession, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          session: serializeGameSession(
            stoppedSession,
            presentation.game,
            presentation.selectedCategory,
            stoppedSession.teams,
            stoppedSession.rounds
          ),
        },
        {
          code: 'GAME_STOPPED',
          message: 'Game stopped.',
          meta: { requestId: request.id() },
        }
      )
    )
  }
}
