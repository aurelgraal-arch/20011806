/**
 * Ranking and leaderboard types
 */

export interface RankingScore {
  user_id: string
  reputation_score: number // weighted 0.5
  mission_score: number // weighted 0.3
  governance_score: number // weighted 0.2
  total_weighted_score: number
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  avatar_url?: string
  total_score: number
  reputation: number
  missions_completed: number
  governance_activity: number
}

export interface LeaderboardData {
  entries: LeaderboardEntry[]
  user_rank?: LeaderboardEntry
  total_users: number
  last_updated: string
}

export interface UserRankProgress {
  current_rank: number
  previous_rank: number
  rank_change: number
  percentile: number
  milestone_progress: number
}
