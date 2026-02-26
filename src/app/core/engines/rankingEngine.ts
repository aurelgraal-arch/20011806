/**
 * Ranking Engine
 * Calculates leaderboard rankings and user rankings
 *
 * Weighted ranking formula:
 * total_score = (reputation * 0.5) + (missions_completed * 0.3) + (governance_activity * 0.2)
 */

import type { RankingScore, LeaderboardEntry, UserRankProgress } from '../../types'

/**
 * Ranking weights
 */
const RANKING_WEIGHTS = {
  REPUTATION: 0.5,
  MISSIONS: 0.3,
  GOVERNANCE: 0.2,
} as const

/**
 * Milestone tiers for notifications
 */
const RANK_MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000] as const

export class RankingEngine {
  /**
   * Calculate weighted ranking score
   */
  static calculateRankingScore(params: {
    reputation: number
    missions_completed: number
    governance_votes: number
    proposals_created: number
  }): RankingScore {
    // Normalize components
    // Reputation: already a score, normalize to 0-1000 scale
    const reputation_score = Math.min(params.reputation, 1000)

    // Missions: each mission worth ~25 points, normalize to 0-1000
    const missions_score = Math.min(params.missions_completed * 25, 1000)

    // Governance: votes + proposals, normalize to 0-1000
    const governance_base = params.governance_votes + params.proposals_created * 5
    const governance_score = Math.min(governance_base * 10, 1000)

    // Apply weights
    const total_weighted_score = Math.round(
      reputation_score * RANKING_WEIGHTS.REPUTATION +
        missions_score * RANKING_WEIGHTS.MISSIONS +
        governance_score * RANKING_WEIGHTS.GOVERNANCE
    )

    return {
      user_id: '',
      reputation_score: reputation_score,
      mission_score: missions_score,
      governance_score: governance_score,
      total_weighted_score,
    }
  }

  /**
   * Calculate position in leaderboard
   */
  static calculateRank(
    _userScore: number,
    allScores: Array<{ user_id: string; score: number }>
  ): number {
    const sortedScores = allScores
      .sort((a, b) => b.score - a.score)
      .map((s, idx) => ({ ...s, rank: idx + 1 }))

    const userRank = sortedScores.find((s) => s.user_id)?.rank || allScores.length
    return userRank
  }

  /**
   * Create leaderboard entry
   */
  static createLeaderboardEntry(
    rank: number,
    scoreData: RankingScore,
    userInfo: {
      user_id: string
      username: string
      avatar_url?: string
    }
  ): LeaderboardEntry {
    return {
      rank,
      user_id: userInfo.user_id,
      username: userInfo.username,
      avatar_url: userInfo.avatar_url,
      total_score: scoreData.total_weighted_score,
      reputation: scoreData.reputation_score,
      missions_completed: Math.round(scoreData.mission_score / 25),
      governance_activity: scoreData.governance_score,
    }
  }

  /**
   * Build leaderboard
   */
  static buildLeaderboard(
    rankings: Array<{
      user_id: string
      username: string
      avatar_url?: string
      reputation: number
      missions_completed: number
      governance_votes: number
      proposals_created: number
    }>,
    currentUserId?: string
  ): {
    entries: LeaderboardEntry[]
    user_entry?: LeaderboardEntry
    last_updated: string
  } {
    // Calculate scores
    const scoredRankings = rankings.map((r) => ({
      ...r,
      score: this.calculateRankingScore({
        reputation: r.reputation,
        missions_completed: r.missions_completed,
        governance_votes: r.governance_votes,
        proposals_created: r.proposals_created,
      }),
    }))

    // Sort by score descending
    const sorted = scoredRankings.sort((a, b) => b.score.total_weighted_score - a.score.total_weighted_score)

    // Create entries
    const entries = sorted.map((item, idx) =>
      this.createLeaderboardEntry(idx + 1, item.score, {
        user_id: item.user_id,
        username: item.username,
        avatar_url: item.avatar_url,
      })
    )

    const user_entry = currentUserId
      ? entries.find((e) => e.user_id === currentUserId)
      : undefined

    return {
      entries,
      user_entry,
      last_updated: new Date().toISOString(),
    }
  }

  /**
   * Calculate rank progress
   */
  static calculateRankProgress(
    currentRank: number,
    previousRank: number | null
  ): UserRankProgress {
    const rank_change = previousRank ? previousRank - currentRank : 0
    const percentile = Math.max(1, Math.round((1 - currentRank / 10000) * 100))

    return {
      current_rank: currentRank,
      previous_rank: previousRank || currentRank,
      rank_change,
      percentile,
      milestone_progress: 0, // percentage to next milestone
    }
  }

  /**
   * Check if user hit a rank milestone
   */
  static checkRankMilestone(
    previousRank: number | null,
    currentRank: number
  ): {
    hit_milestone: boolean
    milestone?: number
    notification?: string
  } {
    // Only notify on upward movement
    if (!previousRank || previousRank <= currentRank) {
      return { hit_milestone: false }
    }

    // Check each milestone
    for (const milestone of RANK_MILESTONES) {
      if (previousRank > milestone && currentRank <= milestone) {
        return {
          hit_milestone: true,
          milestone,
          notification: `Ranked in top ${milestone}! 🎉`,
        }
      }
    }

    return { hit_milestone: false }
  }

  /**
   * Get tier based on rank
   */
  static getRankTier(
    rank: number
  ): 'legendary' | 'elite' | 'master' | 'expert' | 'intermediate' | 'novice' {
    if (rank <= 10) return 'legendary'
    if (rank <= 100) return 'elite'
    if (rank <= 500) return 'master'
    if (rank <= 2000) return 'expert'
    if (rank <= 10000) return 'intermediate'
    return 'novice'
  }

  /**
   * Calculate time to next tier
   */
  static estimateTimeToNextTier(
    currentScore: number,
    growthRate: number // points per day
  ): {
    points_needed: number
    estimated_days: number
    next_tier: string
  } {
    const tiers = [
      { threshold: 500, label: 'Novice' },
      { threshold: 1000, label: 'Intermediate' },
      { threshold: 2000, label: 'Expert' },
      { threshold: 3000, label: 'Master' },
      { threshold: 4000, label: 'Elite' },
      { threshold: 5000, label: 'Legendary' },
    ]

    const nextTier = tiers.find((t) => t.threshold > currentScore)
    if (!nextTier) {
      return {
        points_needed: 0,
        estimated_days: 0,
        next_tier: 'Max Rank',
      }
    }

    const points_needed = nextTier.threshold - currentScore
    const estimated_days = Math.ceil(points_needed / Math.max(growthRate, 1))

    return {
      points_needed,
      estimated_days,
      next_tier: nextTier.label,
    }
  }

  /**
   * Compare users
   */
  static compareUsers(
    user1: { rank: number; score: number; username: string },
    user2: { rank: number; score: number; username: string }
  ): {
    ahead: string
    gap: number
    percentage_ahead: number
  } {
    const gap = Math.abs(user1.score - user2.score)
    const max_score = Math.max(user1.score, user2.score)
    const percentage_ahead = (gap / max_score) * 100

    const ahead = user1.score > user2.score ? user1.username : user2.username

    return {
      ahead,
      gap: Math.round(gap),
      percentage_ahead: Math.round(percentage_ahead),
    }
  }

  /**
   * Generate ranking report
   */
  static generateRankingReport(
    entries: LeaderboardEntry[],
    userRank: number
  ): {
    total_users: number
    top_10: LeaderboardEntry[]
    user_percentile: number
    users_ahead: number
    users_behind: number
  } {
    return {
      total_users: entries.length,
      top_10: entries.slice(0, 10),
      user_percentile: Math.round((1 - userRank / entries.length) * 100),
      users_ahead: userRank - 1,
      users_behind: Math.max(0, entries.length - userRank),
    }
  }
}
