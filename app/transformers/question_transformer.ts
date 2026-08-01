import type GameSessionRound from '#models/game_session_round'
import type Question from '#models/question'
import type QuestionTranslation from '#models/question_translation'

export interface RoundQuestionDto {
  roundId: string
  roundNumber: number
  question: QuestionDto
}

export interface QuestionDto {
  id: string
  type: string
  basePoints: number
  prompt: string
  explanation: string | null
  locale: string
  metadata: Record<string, unknown>
}

export function serializeRoundQuestion(
  round: GameSessionRound,
  question: Question,
  translation: QuestionTranslation
): RoundQuestionDto {
  return {
    roundId: round.id,
    roundNumber: round.roundNumber,
    question: {
      id: question.id,
      type: question.type,
      basePoints: question.basePoints,
      prompt: translation.prompt,
      explanation: translation.explanation,
      locale: translation.locale,
      metadata: translation.metadata,
    },
  }
}
