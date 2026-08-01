import type GameSessionTeam from '#models/game_session_team'

export interface ScoreboardDto {
  teams: ScoreboardTeamDto[]
}

export interface ScoreboardTeamDto {
  id: string
  name: string
  color: string
  score: number
  sortOrder: number
}

export function serializeScoreboard(teams: GameSessionTeam[]): ScoreboardDto {
  return {
    teams: teams
      .map((team) => ({
        id: team.id,
        name: team.name,
        color: team.color,
        score: team.score,
        sortOrder: team.sortOrder,
      }))
      .sort((a, b) => b.score - a.score || a.sortOrder - b.sortOrder),
  }
}
