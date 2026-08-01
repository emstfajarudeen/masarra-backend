import { apiSuccess } from '#http/api_response'
import QuestionScoringService from '#services/question_scoring_service'
import { serializeRoundQuestion } from '#transformers/question_transformer'
import { serializeScoreboard } from '#transformers/scoreboard_transformer'
import {
  serializeGameSession,
  serializeGameSessionRound,
} from '#transformers/game_session_transformer'
import GameSessionSetupService from '#services/game_session_setup_service'
import { roundQuestionParamsValidator, scoreRoundValidator } from '#validators/scoring'
import { gameplaySessionParamsValidator } from '#validators/gameplay'
import type User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class RoundQuestionsController {
  private scoring = new QuestionScoringService()
  private setup = new GameSessionSetupService()

  async assignQuestion({ request, response, auth, i18n }: HttpContext) {
    const payload = await request.validateUsing(roundQuestionParamsValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.scoring.getOwnedSession(payload.params.id, user)
    const { round, question, translation } = await this.scoring.assignQuestion(
      session,
      payload.params.roundId,
      i18n.locale
    )

    return response.ok(
      apiSuccess(serializeRoundQuestion(round, question, translation), {
        code: 'ROUND_QUESTION_ASSIGNED',
        message: 'Round question assigned.',
        meta: { requestId: request.id() },
      })
    )
  }

  async score({ request, response, auth, i18n }: HttpContext) {
    const payload = await request.validateUsing(scoreRoundValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.scoring.getOwnedSession(payload.params.id, user)
    const round = await this.scoring.scoreRound(session, payload.params.roundId, {
      winnerTeamId: payload.winnerTeamId,
      scoringRule: payload.scoringRule,
      submittedAnswer: payload.submittedAnswer,
      isCorrect: payload.isCorrect,
      metadata: payload.metadata,
    })
    const presentation = await this.setup.getPresentation(session, i18n.locale)

    return response.ok(
      apiSuccess(
        {
          round: serializeGameSessionRound(round),
          scoreboard: serializeScoreboard(session.teams),
          session: serializeGameSession(
            session,
            presentation.game,
            presentation.selectedCategory,
            session.teams,
            session.rounds
          ),
        },
        {
          code: 'ROUND_SCORED',
          message: 'Round scored.',
          meta: { requestId: request.id() },
        }
      )
    )
  }

  async scoreboard({ request, response, auth }: HttpContext) {
    const {
      params: { id },
    } = await request.validateUsing(gameplaySessionParamsValidator)
    const user = auth.getUserOrFail() as User
    const session = await this.scoring.getOwnedSession(id, user)
    const teams = await this.scoring.getScoreboard(session)

    return response.ok(
      apiSuccess(serializeScoreboard(teams), {
        code: 'SCOREBOARD',
        message: 'Scoreboard retrieved.',
        meta: { requestId: request.id() },
      })
    )
  }
}
