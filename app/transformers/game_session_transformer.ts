import type GameSession from '#models/game_session'
import type GameSessionRound from '#models/game_session_round'
import type GameSessionTeam from '#models/game_session_team'
import type { MasterGameDto, MasterQuestionCategoryDto } from '#transformers/master_transformer'

export interface GameSessionDto {
  id: string
  status: string
  selectedRoundCount: number | null
  selectedQuestionDuration: number | null
  currentRoundNumber: number | null
  completedRoundCount: number
  refundedCreditCount: number
  locked: boolean
  creditReservation: {
    status: string
    reservedCreditCount: number
    reservedAt: string | null
  }
  lockedAt: string | null
  startedAt: string | null
  endedAt: string | null
  game: MasterGameDto
  selectedCategory: MasterQuestionCategoryDto | null
  teams: GameSessionTeamDto[]
  rounds: GameSessionRoundDto[]
  createdAt: string | null
}

export interface GameSessionTeamDto {
  id: string
  name: string
  color: string
  score: number
  sortOrder: number
}

export interface GameSessionRoundDto {
  id: string
  roundNumber: number
  status: string
  creditOutcome: string
  questionId: string | null
  winnerTeamId: string | null
  scoringRule: string | null
  awardedPoints: number
  startedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  abandonedAt: string | null
}

export function serializeGameSession(
  session: GameSession,
  game: MasterGameDto,
  selectedCategory: MasterQuestionCategoryDto | null,
  teams: GameSessionTeam[] = [],
  rounds: GameSessionRound[] = []
): GameSessionDto {
  return {
    id: session.id,
    status: session.status,
    selectedRoundCount: session.selectedRoundCount,
    selectedQuestionDuration: session.selectedQuestionDuration,
    currentRoundNumber: session.currentRoundNumber,
    completedRoundCount: session.completedRoundCount,
    refundedCreditCount: session.refundedCreditCount,
    locked: session.lockedAt !== null,
    creditReservation: {
      status: session.creditReservationStatus,
      reservedCreditCount: session.reservedCreditCount,
      reservedAt: session.creditsReservedAt?.toISO() ?? null,
    },
    lockedAt: session.lockedAt?.toISO() ?? null,
    startedAt: session.startedAt?.toISO() ?? null,
    endedAt: session.endedAt?.toISO() ?? null,
    game,
    selectedCategory,
    teams: teams.map(serializeGameSessionTeam),
    rounds: rounds.map(serializeGameSessionRound),
    createdAt: session.createdAt?.toISO() ?? null,
  }
}

export function serializeGameSessionTeam(team: GameSessionTeam): GameSessionTeamDto {
  return {
    id: team.id,
    name: team.name,
    color: team.color,
    score: team.score,
    sortOrder: team.sortOrder,
  }
}

export function serializeGameSessionRound(round: GameSessionRound): GameSessionRoundDto {
  return {
    id: round.id,
    roundNumber: round.roundNumber,
    status: round.status,
    creditOutcome: round.creditOutcome,
    questionId: round.questionId,
    winnerTeamId: round.winnerTeamId,
    scoringRule: round.scoringRule,
    awardedPoints: round.awardedPoints,
    startedAt: round.startedAt?.toISO() ?? null,
    completedAt: round.completedAt?.toISO() ?? null,
    cancelledAt: round.cancelledAt?.toISO() ?? null,
    abandonedAt: round.abandonedAt?.toISO() ?? null,
  }
}
