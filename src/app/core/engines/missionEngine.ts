/**
 * Mission Engine
 * Manages mission lifecycle and validation
 *
 * Mission types:
 * - daily: 1-per-day, quick tasks
 * - weekly: 1-per-week, moderate tasks
 * - governance: voting/proposals
 * - community: collaborative tasks
 * - milestone: long-term goals
 */

import type { Mission } from '../../types'
import { MissionType, MissionStatus } from '../../types'

interface MissionValidation {
  valid: boolean
  error?: string
  reason?: string
}

/**
 * Mission availability rules
 */
const MISSION_COOLDOWNS = {
  daily: 24, // hours
  weekly: 7 * 24,
  governance: 12,
  community: 48,
  milestone: 0, // no cooldown
} as const

export class MissionEngine {
  /**
   * Check if user can access a mission
   */
  static canAccessMission(
    mission: Mission,
    userReputation: number,
    userLevel: number,
    lastCompletedTime?: Date
  ): MissionValidation {
    // Check reputation requirement
    if (userReputation < mission.min_reputation_required) {
      return {
        valid: false,
        reason: 'insufficient_reputation',
        error: `Requires ${mission.min_reputation_required} reputation. You have ${userReputation}`,
      }
    }

    // Check level requirement
    if (userLevel < mission.min_level_required) {
      return {
        valid: false,
        reason: 'insufficient_level',
        error: `Requires level ${mission.min_level_required}. You are level ${userLevel}`,
      }
    }

    // Check mission status
    if (mission.status === MissionStatus.LOCKED) {
      return {
        valid: false,
        reason: 'mission_locked',
        error: 'This mission is locked',
      }
    }

    if (mission.status === MissionStatus.EXPIRED) {
      return {
        valid: false,
        reason: 'mission_expired',
        error: 'This mission has expired',
      }
    }

    // Check cooldown
    if (lastCompletedTime) {
      const cooldownHours = MISSION_COOLDOWNS[mission.type]
      const timeSinceCompletion = Date.now() - lastCompletedTime.getTime()
      const hoursPassed = timeSinceCompletion / (1000 * 60 * 60)

      if (hoursPassed < cooldownHours) {
        const hoursRemaining = Math.ceil(cooldownHours - hoursPassed)
        return {
          valid: false,
          reason: 'cooldown_active',
          error: `Cooldown active. Available in ${hoursRemaining} hours`,
        }
      }
    }

    // Check max participants
    if (
      mission.max_participants &&
      mission.current_participants &&
      mission.current_participants >= mission.max_participants
    ) {
      return {
        valid: false,
        reason: 'mission_full',
        error: 'This mission has reached maximum participants',
      }
    }

    // Check expiration
    if (new Date() > new Date(mission.expires_at)) {
      return {
        valid: false,
        reason: 'mission_expired',
        error: 'This mission has expired',
      }
    }

    return { valid: true }
  }

  /**
   * Calculate mission progress
   */
  static calculateProgress(params: {
    requirements_met: number
    total_requirements: number
    time_spent_seconds: number
    total_time_allowed_seconds: number
  }): {
    requirement_progress: number
    time_progress: number
    overall_progress: number
  } {
    const requirement_progress = Math.round(
      (params.requirements_met / params.total_requirements) * 100
    )
    const time_progress = Math.round(
      (params.time_spent_seconds / params.total_time_allowed_seconds) * 100
    )
    const overall_progress = Math.round((requirement_progress + time_progress) / 2)

    return {
      requirement_progress,
      time_progress,
      overall_progress: Math.min(overall_progress, 100),
    }
  }

  /**
   * Calculate bonus for early completion
   */
  static calculateCompletionBonus(params: {
    base_reward: number
    time_spent_seconds: number
    total_time_allowed_seconds: number
  }): {
    base_reward: number
    bonus_multiplier: number
    total_reward: number
  } {
    const timePct = params.time_spent_seconds / params.total_time_allowed_seconds
    let bonus_multiplier = 1.0

    if (timePct <= 0.5) {
      bonus_multiplier = 1.5 // 50% bonus for completing in half the time
    } else if (timePct <= 0.75) {
      bonus_multiplier = 1.25 // 25% bonus
    }

    const total_reward = Math.round(params.base_reward * bonus_multiplier)

    return {
      base_reward: params.base_reward,
      bonus_multiplier,
      total_reward,
    }
  }

  /**
   * Validate mission completion
   */
  static validateCompletion(
    mission: Mission,
    completionData: Record<string, any>
  ): MissionValidation {
    // This would be customized per mission type
    if (!completionData || Object.keys(completionData).length === 0) {
      return {
        valid: false,
        error: 'Completion data required',
      }
    }

    // Check required fields based on mission type
    const requiredFields = this.getRequiredCompletionFields(mission.type)
    for (const field of requiredFields) {
      if (!(field in completionData)) {
        return {
          valid: false,
          error: `Missing required field: ${field}`,
        }
      }
    }

    return { valid: true }
  }

  /**
   * Get required completion fields by mission type
   */
  private static getRequiredCompletionFields(missionType: MissionType): string[] {
    const fields: Record<MissionType, string[]> = {
      daily: ['task_completed'],
      weekly: ['milestone_achieved', 'evidence'],
      governance: ['vote_cast', 'proposal_id'],
      community: ['participation_proof', 'contribution_date'],
      milestone: ['final_achievement', 'summary'],
    }
    return fields[missionType] || []
  }

  /**
   * Get available missions for user
   */
  static filterAvailableMissions(
    missions: Mission[],
    userReputation: number,
    userLevel: number,
    completedMissionIds: string[],
    lastCompletionTimes: Record<string, Date>
  ): Mission[] {
    return missions.filter((mission) => {
      // Skip already completed today (for daily missions)
      if (
        mission.type === MissionType.DAILY &&
        completedMissionIds.includes(mission.id)
      ) {
        return false
      }

      const lastCompleted = lastCompletionTimes[mission.id]
      const canAccess = this.canAccessMission(
        mission,
        userReputation,
        userLevel,
        lastCompleted
      )

      return canAccess.valid
    })
  }

  /**
   * Calculate mission statistics
   */
  static calculateMissionStats(missions: Mission[]): {
    total_missions: number
    by_type: Record<MissionType, number>
    total_potential_rewards: number
    total_potential_reputation: number
  } {
    const stats = {
      total_missions: missions.length,
      by_type: {
        daily: 0,
        weekly: 0,
        governance: 0,
        community: 0,
        milestone: 0,
      } as Record<MissionType, number>,
      total_potential_rewards: 0,
      total_potential_reputation: 0,
    }

    missions.forEach((mission) => {
      stats.by_type[mission.type]++
      stats.total_potential_rewards += mission.reward_tokens
      stats.total_potential_reputation += mission.reputation_gain
    })

    return stats
  }

  /**
   * Suggest next mission based on user profile
   */
  static suggestNextMission(
    availableMissions: Mission[],
    _userReputation: number,
    _userLevel: number,
    recentMissionTypes: MissionType[]
  ): Mission | null {
    if (availableMissions.length === 0) return null

    // Prioritize mission types not done recently
    const missionTypeScores: Record<MissionType, number> = {
      daily: 1,
      weekly: 2,
      governance: 3,
      community: 3,
      milestone: 4,
    }

    recentMissionTypes.forEach((type) => {
      missionTypeScores[type] -= 0.5
    })

    let bestMission: Mission | null = null
    let bestScore = -Infinity

    availableMissions.forEach((mission) => {
      const typeScore = missionTypeScores[mission.type]
      const rewardScore = mission.reward_tokens * 0.1
      const totalScore = typeScore + rewardScore

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestMission = mission
      }
    })

    return bestMission
  }
}
