import type CreditTransaction from '#models/credit_transaction'
import type GameSession from '#models/game_session'
import type GameSessionRound from '#models/game_session_round'
import type GameSessionTeam from '#models/game_session_team'
import type Payment from '#models/payment'

function serializeDate(value: { toISO(): string | null } | null | undefined) {
  return value?.toISO() ?? null
}

function localizedTitle(
  source: { translations?: { locale: string; title: string }[] } | null | undefined
) {
  return source?.translations?.[0]?.title ?? null
}

export function serializeAccountGameHistoryItem(session: GameSession) {
  const winningScore =
    session.$preloaded.teams && session.teams.length > 0
      ? Math.max(...session.teams.map((team) => team.score))
      : null

  const winners =
    winningScore === null
      ? []
      : session.teams
          .filter((team) => team.score === winningScore)
          .map((team) => ({
            id: team.id,
            name: team.name,
            color: team.color,
            score: team.score,
          }))

  return {
    id: session.id,
    status: session.status,
    game: {
      id: session.gameId,
      slug: session.$preloaded.game ? session.game.slug : null,
      title: localizedTitle(session.$preloaded.game ? session.game : null),
    },
    selectedCategory: session.optionalQuestionCategoryId
      ? {
          id: session.optionalQuestionCategoryId,
          slug: session.$preloaded.optionalQuestionCategory
            ? session.optionalQuestionCategory.slug
            : null,
          title: localizedTitle(
            session.$preloaded.optionalQuestionCategory ? session.optionalQuestionCategory : null
          ),
        }
      : null,
    selectedRoundCount: session.selectedRoundCount,
    selectedQuestionDuration: session.selectedQuestionDuration,
    completedRoundCount: session.completedRoundCount,
    reservedCreditCount: session.reservedCreditCount,
    refundedCreditCount: session.refundedCreditCount,
    creditReservationStatus: session.creditReservationStatus,
    winners,
    startedAt: serializeDate(session.startedAt),
    endedAt: serializeDate(session.endedAt),
    stoppedAt: serializeDate(session.stoppedAt),
    createdAt: serializeDate(session.createdAt),
  }
}

export function serializeAccountGameHistoryDetail(session: GameSession) {
  return {
    ...serializeAccountGameHistoryItem(session),
    stopReason: session.stopReason,
    teams: session.$preloaded.teams ? session.teams.map(serializeHistoryTeam) : [],
    rounds: session.$preloaded.rounds ? session.rounds.map(serializeHistoryRound) : [],
  }
}

export function serializeHistoryTeam(team: GameSessionTeam) {
  return {
    id: team.id,
    name: team.name,
    color: team.color,
    score: team.score,
    sortOrder: team.sortOrder,
  }
}

export function serializeHistoryRound(round: GameSessionRound) {
  return {
    id: round.id,
    roundNumber: round.roundNumber,
    status: round.status,
    creditOutcome: round.creditOutcome,
    questionId: round.questionId,
    winnerTeamId: round.winnerTeamId,
    scoringRule: round.scoringRule,
    awardedPoints: round.awardedPoints,
    startedAt: serializeDate(round.startedAt),
    completedAt: serializeDate(round.completedAt),
    cancelledAt: serializeDate(round.cancelledAt),
    abandonedAt: serializeDate(round.abandonedAt),
  }
}

export function serializeAccountPaymentHistoryItem(payment: Payment) {
  return {
    id: payment.id,
    gameSessionId: payment.gameSessionId,
    payableType: payment.payableType,
    method: payment.method,
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    provider: payment.provider,
    providerReference: payment.providerReference,
    expiresAt: serializeDate(payment.expiresAt),
    paidAt: serializeDate(payment.paidAt),
    createdAt: serializeDate(payment.createdAt),
  }
}

export function serializeAccountCreditTransactionItem(transaction: CreditTransaction) {
  return {
    id: transaction.id,
    gameSessionId: transaction.gameSessionId,
    type: transaction.type,
    amount: transaction.amount,
    currency: transaction.currency,
    description: transaction.description,
    metadata: transaction.metadata,
    createdAt: serializeDate(transaction.createdAt),
  }
}
