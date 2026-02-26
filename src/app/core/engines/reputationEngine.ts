/**
 * Reputation Engine
 * Calculates user reputation based on activities
 *
 * Reputation is earned from:
 * - Completed missions
 * - Governance participation
 * - Consistency streaks
 * - Forum activity (future)
 *
 * Reputation unlocks:
 * - Higher level access
 * - Proposal creation rights
 * - Greater governance weight
 * - Special missions
 */

interface ReputationLevel {
  level: number
  min_reputation: number
  max_reputation: number
  features_unlocked: string[]
}

/**
 * Base reputation values for different activities
 */
const REPUTATION_VALUES = {
  MISSION_DAILY: 10,
  MISSION_WEEKLY: 30,
  MISSION_COMMUNITY: 25,
  MISSION_GOVERNANCE: 50,
  MISSION_MILESTONE: 100,
  GOVERNANCE_VOTE: 5,
  PROPOSAL_CREATED: 15,
  CONSISTENCY_BONUS: 2, // per streak day
  FORUM_POST: 3,
} as const

/**
 * Reputation levels and their unlock conditions
 */
const REPUTATION_LEVELS: ReputationLevel[] = [
  {
    level: 1,
    min_reputation: 0,
    max_reputation: 99,
    features_unlocked: ['basic_missions'],
  },
  {
    level: 2,
    min_reputation: 100,
    max_reputation: 249,
    features_unlocked: ['daily_missions', 'vote_on_proposals'],
  },
  {
    level: 3,
    min_reputation: 250,
    max_reputation: 499,
    features_unlocked: ['weekly_missions', 'create_proposals'],
  },
  {
    level: 4,
    min_reputation: 500,
    max_reputation: 999,
    features_unlocked: ['community_missions', 'governance_votes_count_2x'],
  },
  {
    level: 5,
    min_reputation: 1000,
    max_reputation: Infinity,
    features_unlocked: ['all_missions', 'governance_votes_count_3x', 'become_moderator'],
  },
]

export class ReputationEngine {
  /**
   * Calculate reputation gained from completing a mission
   */
  static calculateMissionReputation(
    missionType: 'daily' | 'weekly' | 'governance' | 'community' | 'milestone'
  ): number {
    const values = {
      daily: REPUTATION_VALUES.MISSION_DAILY,
      weekly: REPUTATION_VALUES.MISSION_WEEKLY,
      community: REPUTATION_VALUES.MISSION_COMMUNITY,
      governance: REPUTATION_VALUES.MISSION_GOVERNANCE,
      milestone: REPUTATION_VALUES.MISSION_MILESTONE,
    }
    return values[missionType]
  }

  /**
   * Calculate reputation from governance participation
   */
  static calculateGovernanceReputation(action: 'vote' | 'proposal'): number {
    return action === 'vote'
      ? REPUTATION_VALUES.GOVERNANCE_VOTE
      : REPUTATION_VALUES.PROPOSAL_CREATED
  }

  /**
   * Calculate consistency bonus based on streak
   */
  static calculateConsistencyBonus(streakDays: number): number {
    // Exponential bonus: every 5-day milestone grants 5x multiplier
    const milestone = Math.floor(streakDays / 5)
    const baseBonus = REPUTATION_VALUES.CONSISTENCY_BONUS * streakDays
    const milestoneBonus = milestone > 0 ? milestone * 10 : 0
    return baseBonus + milestoneBonus
  }

  /**
   * Get user level based on total reputation
   */
  static getUserLevel(totalReputation: number): number {
    const level = REPUTATION_LEVELS.findIndex(
      (l) => totalReputation >= l.min_reputation && totalReputation <= l.max_reputation
    )
    return level !== -1 ? level + 1 : REPUTATION_LEVELS.length
  }

  /**
   * Get features unlocked at a given reputation level
   */
  static getUnlockedFeatures(totalReputation: number): string[] {
    const level = this.getUserLevel(totalReputation)
    const levelData = REPUTATION_LEVELS[level - 1]
    return levelData?.features_unlocked || []
  }

  /**
   * Calculate reputation progression to next level
   */
  static getProgressToNextLevel(totalReputation: number): {
    current_level: number
    next_level: number
    current_rep: number
    next_level_required: number
    progress_percentage: number
  } {
    const currentLevel = this.getUserLevel(totalReputation)
    const currentLevelData = REPUTATION_LEVELS[currentLevel - 1]
    const nextLevelData = REPUTATION_LEVELS[currentLevel]

    if (!nextLevelData) {
      return {
        current_level: currentLevel,
        next_level: currentLevel,
        current_rep: totalReputation,
        next_level_required: totalReputation,
        progress_percentage: 100,
      }
    }

    const repInCurrentLevel = totalReputation - currentLevelData.min_reputation
    const repNeededForLevel =
      nextLevelData.min_reputation - currentLevelData.min_reputation
    const progressPercentage = Math.min(
      100,
      (repInCurrentLevel / repNeededForLevel) * 100
    )

    return {
      current_level: currentLevel,
      next_level: currentLevel + 1,
      current_rep: totalReputation,
      next_level_required: nextLevelData.min_reputation,
      progress_percentage: progressPercentage,
    }
  }

  /**
   * Check if user can perform an action based on reputation
   */
  static canPerformAction(
    action: string,
    userReputation: number
  ): { allowed: boolean; required_reputation?: number } {
    const actionRequirements: Record<string, number> = {
      create_proposal: 250,
      moderate_content: 500,
      create_community_mission: 1000,
      access_admin_panel: 5000,
    }

    const required = actionRequirements[action]
    if (required === undefined) {
      return { allowed: true }
    }

    return {
      allowed: userReputation >= required,
      required_reputation: required,
    }
  }

  /**
   * Simulate total reputation calculation
   * Used for ranking and leaderboard purposes
   */
  static calculateTotalReputation(components: {
    missions_completed: number
    governance_votes: number
    proposals_created: number
    consistency_streak: number
  }): number {
    let total = 0

    // This is a simplified calculation
    // In production, these would come from actual database records
    total += components.missions_completed * 25 // average mission
    total += components.governance_votes * REPUTATION_VALUES.GOVERNANCE_VOTE
    total += components.proposals_created * REPUTATION_VALUES.PROPOSAL_CREATED
    total += this.calculateConsistencyBonus(components.consistency_streak)

    return Math.round(total)
  }
}
