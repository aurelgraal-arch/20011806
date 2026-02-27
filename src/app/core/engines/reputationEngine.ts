/**
 * Reputation Engine
 * Calculates user levels and reputation metrics
 */

export class ReputationEngine {
  // Level thresholds: reputation points needed for each level
  private static readonly LEVEL_THRESHOLDS = [
    0,      // Level 0
    1000,   // Level 1
    3000,   // Level 2
    6000,   // Level 3
    10000,  // Level 4
    15000,  // Level 5
    21000,  // Level 6
    28000,  // Level 7
    36000,  // Level 8
    45000,  // Level 9
  ]

  /**
   * Get user level based on reputation
   */
  static getUserLevel(reputation: number): number {
    let level = 0
    for (let i = 0; i < this.LEVEL_THRESHOLDS.length; i++) {
      if (reputation >= this.LEVEL_THRESHOLDS[i]) {
        level = i
      } else {
        break
      }
    }
    return level
  }

  /**
   * Get progress to next level
   */
  static getProgressToNextLevel(reputation: number) {
    const currentLevel = this.getUserLevel(reputation)
    const nextLevelIndex = Math.min(currentLevel + 1, this.LEVEL_THRESHOLDS.length - 1)
    
    const currentLevelRep = this.LEVEL_THRESHOLDS[currentLevel]
    const nextLevelRep = this.LEVEL_THRESHOLDS[nextLevelIndex]
    
    const totalNeeded = nextLevelRep - currentLevelRep
    const currentProgress = reputation - currentLevelRep
    const progress = totalNeeded > 0 ? (currentProgress / totalNeeded) * 100 : 100

    return {
      current: currentLevelRep,
      next: nextLevelRep,
      progress: Math.min(progress, 100),
      // Additional properties for compatibility
      current_rep: reputation,
      current_level: currentLevel,
      next_level: nextLevelIndex,
      next_level_required: nextLevelRep,
      progress_percentage: Math.min(progress, 100),
    }
  }

  /**
   * Get reputation needed for a specific level
   */
  static getReputationForLevel(level: number): number {
    if (level <= 0) return 0
    if (level >= this.LEVEL_THRESHOLDS.length) {
      return this.LEVEL_THRESHOLDS[this.LEVEL_THRESHOLDS.length - 1]
    }
    return this.LEVEL_THRESHOLDS[level]
  }

  /**
   * Calculate reputation gained from an action
   */
  static calculateReputationGain(action: string): number {
    const gains: Record<string, number> = {
      mission_complete: 100,
      mission_review: 50,
      contribution: 75,
      voting: 10,
      comment: 5,
    }
    return gains[action] || 0
  }

  /**
   * Get unlocked features based on reputation level
   */
  static getUnlockedFeatures(reputation: number): string[] {
    const level = this.getUserLevel(reputation)
    const features: string[] = []

    // Base features available at level 0
    if (level >= 0) {
      features.push('View_Profile')
      features.push('Basic_Participation')
    }

    // Level 1+ features
    if (level >= 1) {
      features.push('Create_Forum_Posts')
      features.push('Comment')
    }

    // Level 2+ features
    if (level >= 2) {
      features.push('Create_Missions')
      features.push('Moderation')
    }

    // Level 3+ features
    if (level >= 3) {
      features.push('Advanced_Analytics')
      features.push('Custom_Profile')
    }

    // Level 4+ features
    if (level >= 4) {
      features.push('Governance_Voting')
      features.push('Resource_Management')
    }

    // Level 5+ features
    if (level >= 5) {
      features.push('Team_Leadership')
      features.push('Advanced_Reporting')
    }

    return features
  }
}
