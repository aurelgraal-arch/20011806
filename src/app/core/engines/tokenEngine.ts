/**
 * Token Economy Engine
 * Manages internal token system for:
 * - Voting weight calculation
 * - Reward distribution
 * - Governance access
 * - Staking
 *
 * Tokens are earned through:
 * - Mission completion
 * - Governance participation
 * - Rank bonuses
 * - Special events
 *
 * Tokens are spent on:
 * - Claiming rewards
 * - Governance proposals (future)
 * - Special unlocks (future)
 */

interface TokenTransaction {
  user_id: string
  amount: number
  type: 'reward' | 'spend' | 'stake' | 'unstake' | 'claim'
  description: string
  metadata?: Record<string, any>
}

interface GovernanceWeight {
  reputation_weight: number
  token_weight: number
  combined_weight: number
  vote_multiplier: number
}

/**
 * Token distribution parameter
 */
const TOKEN_DISTRIBUTION = {
  MISSION_DAILY_REWARD: 10,
  MISSION_WEEKLY_REWARD: 50,
  MISSION_COMMUNITY_REWARD: 40,
  MISSION_GOVERNANCE_REWARD: 100,
  MISSION_MILESTONE_REWARD: 200,
  RANK_BONUS_TOP_100: 50,
  RANK_BONUS_TOP_1000: 20,
  GOVERNANCE_VOTE_BONUS: 5,
} as const

/**
 * Staking parameters
 */
const STAKING_CONFIG = {
  MIN_STAKE: 10,
  MAX_STAKE: 100000,
  ANNUAL_YIELD_PERCENTAGE: 12, // 12% APY
  LOCK_PERIOD_DAYS: 30,
  EARLY_WITHDRAWAL_PENALTY: 0.1, // 10% penalty
} as const

export class TokenEngine {
  /**
   * Calculate token reward for mission completion
   */
  static calculateMissionReward(
    missionType: 'daily' | 'weekly' | 'community' | 'governance' | 'milestone'
  ): number {
    const rewards = {
      daily: TOKEN_DISTRIBUTION.MISSION_DAILY_REWARD,
      weekly: TOKEN_DISTRIBUTION.MISSION_WEEKLY_REWARD,
      community: TOKEN_DISTRIBUTION.MISSION_COMMUNITY_REWARD,
      governance: TOKEN_DISTRIBUTION.MISSION_GOVERNANCE_REWARD,
      milestone: TOKEN_DISTRIBUTION.MISSION_MILESTONE_REWARD,
    }
    return rewards[missionType]
  }

  /**
   * Calculate governance voting power based on reputation + tokens
   */
  static calculateGovernanceWeight(params: {
    user_reputation: number
    token_balance: number
    staked_tokens: number
  }): GovernanceWeight {
    // Normalize reputation to weight (1 reputation = 0.1 voting power)
    const reputation_weight = params.user_reputation * 0.1

    // Normalize tokens (1 token = 1 voting power)
    const token_weight = params.token_balance * 1.0

    // Staked tokens have 1.5x weight multiplier
    const staked_weight = params.staked_tokens * 1.5

    const combined_weight = reputation_weight + token_weight + staked_weight

    // Calculate vote multiplier based on reputation level
    const multiplier =
      params.user_reputation >= 1000 ? 3.0 : params.user_reputation >= 500 ? 2.0 : 1.0

    return {
      reputation_weight,
      token_weight: token_weight + staked_weight,
      combined_weight,
      vote_multiplier: multiplier,
    }
  }

  /**
   * Calculate rank-based token bonus
   */
  static calculateRankBonus(rank: number): number {
    if (rank <= 100) {
      return TOKEN_DISTRIBUTION.RANK_BONUS_TOP_100
    }
    if (rank <= 1000) {
      return TOKEN_DISTRIBUTION.RANK_BONUS_TOP_1000
    }
    return 0
  }

  /**
   * Calculate staking rewards
   */
  static calculateStakingReward(params: {
    staked_amount: number
    staking_days: number
  }): {
    base_reward: number
    total_with_compounding: number
  } {
    const dailyYield =
      (params.staked_amount * STAKING_CONFIG.ANNUAL_YIELD_PERCENTAGE) / 100 / 365

    const base_reward = dailyYield * params.staking_days
    const compound_rate = Math.pow(
      1 + STAKING_CONFIG.ANNUAL_YIELD_PERCENTAGE / 100 / 365,
      params.staking_days
    )
    const total_with_compounding = params.staked_amount * (compound_rate - 1)

    return {
      base_reward: Math.round(base_reward),
      total_with_compounding: Math.round(total_with_compounding),
    }
  }

  /**
   * Calculate early withdrawal penalty
   */
  static calculateEarlyWithdrawalPenalty(
    stakedAmount: number,
    daysPassed: number
  ): {
    penalty: number
    net_amount: number
    penalty_percentage: number
  } {
    const lockPeriod = STAKING_CONFIG.LOCK_PERIOD_DAYS
    const isPenalized = daysPassed < lockPeriod
    const penaltyPercentage = isPenalized ? STAKING_CONFIG.EARLY_WITHDRAWAL_PENALTY : 0
    const penalty = Math.round(stakedAmount * penaltyPercentage)
    const net_amount = stakedAmount - penalty

    return {
      penalty,
      net_amount,
      penalty_percentage: penaltyPercentage * 100,
    }
  }

  /**
   * Validate token transaction
   */
  static validateTransaction(
    transaction: TokenTransaction,
    userBalance: number
  ): { valid: boolean; error?: string } {
    if (transaction.type === 'spend' || transaction.type === 'stake') {
      if (transaction.amount > userBalance) {
        return {
          valid: false,
          error: 'Insufficient token balance',
        }
      }
    }

    if (transaction.type === 'stake') {
      if (transaction.amount < STAKING_CONFIG.MIN_STAKE) {
        return {
          valid: false,
          error: `Minimum stake is ${STAKING_CONFIG.MIN_STAKE} tokens`,
        }
      }
      if (transaction.amount > STAKING_CONFIG.MAX_STAKE) {
        return {
          valid: false,
          error: `Maximum stake is ${STAKING_CONFIG.MAX_STAKE} tokens`,
        }
      }
    }

    return { valid: true }
  }

  /**
   * Calculate token circulation (total tokens in system)
   */
  static estimateTokenCirculation(params: {
    total_missions_completed: number
    total_users: number
    avg_user_tokens: number
  }): {
    distributed_from_missions: number
    in_wallets: number
    total_circulation: number
  } {
    const distributed_from_missions = params.total_missions_completed * 40 // average mission reward
    const in_wallets = params.total_users * params.avg_user_tokens
    const total_circulation = distributed_from_missions + in_wallets

    return {
      distributed_from_missions,
      in_wallets,
      total_circulation,
    }
  }

  /**
   * Get transaction history for ledger
   */
  static generateLedgerEntry(transaction: TokenTransaction) {
    return {
      ...transaction,
      timestamp: new Date().toISOString(),
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }
}
