/**
 * Governance Engine
 * Manages proposals, voting, and governance mechanics
 *
 * Users can:
 * - Create proposals (min reputation: 250)
 * - Vote on proposals (based on reputation + tokens)
 * - Track voting results
 * - Monitor proposal lifecycle
 */

import type { Proposal, ProposalStats } from '../../types'
import { ProposalStatus, VoteOption } from '../../types'

interface VotingWeight {
  user_reputation: number
  user_tokens: number
  staked_tokens: number
  calculated_weight: number
}

/**
 * Governance configuration
 */
const GOVERNANCE_CONFIG = {
  MIN_REPUTATION_TO_CREATE: 250,
  MIN_LEVEL_TO_CREATE: 3,
  VOTING_DURATION_HOURS: 72,
  MIN_PARTICIPATION_PERCENTAGE: 10,
  MIN_SUPERMAJORITY_PERCENTAGE: 66.7,
  PROPOSAL_MAX_LENGTH: 5000,
} as const

export class GovernanceEngine {
  /**
   * Check if user can create a proposal
   */
  static canCreateProposal(
    userReputation: number,
    userLevel: number,
    proposalCount?: number
  ): {
    allowed: boolean
    reason?: string
  } {
    if (userReputation < GOVERNANCE_CONFIG.MIN_REPUTATION_TO_CREATE) {
      return {
        allowed: false,
        reason: `Minimum ${GOVERNANCE_CONFIG.MIN_REPUTATION_TO_CREATE} reputation required`,
      }
    }

    if (userLevel < GOVERNANCE_CONFIG.MIN_LEVEL_TO_CREATE) {
      return {
        allowed: false,
        reason: `Minimum level ${GOVERNANCE_CONFIG.MIN_LEVEL_TO_CREATE} required`,
      }
    }

    // Rate limiting: max 1 proposal per week per user
    if (proposalCount) {
      // This would check database for proposals created in last 7 days
      // For now, just return allowed
    }

    return { allowed: true }
  }

  /**
   * Validate proposal content
   */
  static validateProposal(content: {
    title: string
    description: string
    detailed_content: string
  }): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!content.title || content.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters')
    }

    if (!content.description || content.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters')
    }

    if (!content.detailed_content || content.detailed_content.length === 0) {
      errors.push('Detailed content is required')
    }

    if (content.detailed_content.length > GOVERNANCE_CONFIG.PROPOSAL_MAX_LENGTH) {
      errors.push(
        `Content exceeds maximum length of ${GOVERNANCE_CONFIG.PROPOSAL_MAX_LENGTH}`
      )
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Calculate voting weight for a user
   */
  static calculateVotingWeight(params: {
    reputation: number
    token_balance: number
    staked_tokens: number
  }): VotingWeight {
    // Reputation weight: 1 rep = 0.1 voting power
    const reputation_weight = params.reputation * 0.1

    // Token weight: 1 token = 1 voting power
    const token_weight = params.token_balance * 1.0

    // Staked tokens have 1.5x multiplier
    const staked_weight = params.staked_tokens * 1.5

    const calculated_weight = reputation_weight + token_weight + staked_weight

    return {
      user_reputation: params.reputation,
      user_tokens: params.token_balance,
      staked_tokens: params.staked_tokens,
      calculated_weight: Math.round(calculated_weight * 100) / 100,
    }
  }

  /**
   * Check if user already voted on proposal
   */
  static hasUserVoted(votes: Array<{ user_id: string }>, userId: string): boolean {
    return votes.some((vote) => vote.user_id === userId)
  }

  /**
   * Calculate proposal results
   */
  static calculateProposalResults(votes: Array<{
    vote: VoteOption
    voting_power: number
  }>): ProposalStats {
    let stats = {
      proposal_id: '',
      total_votes: votes.length,
      votes_for: 0,
      votes_against: 0,
      votes_abstain: 0,
      voting_power_for: 0,
      voting_power_against: 0,
      voting_power_abstain: 0,
      participation_rate: 0,
    }

    votes.forEach((v) => {
      if (v.vote === VoteOption.FOR) {
        stats.votes_for++
        stats.voting_power_for += v.voting_power
      } else if (v.vote === VoteOption.AGAINST) {
        stats.votes_against++
        stats.voting_power_against += v.voting_power
      } else {
        stats.votes_abstain++
        stats.voting_power_abstain += v.voting_power
      }
    })

    return stats
  }

  /**
   * Determine proposal outcome based on voting results
   */
  static determineOutcome(
    stats: ProposalStats
  ): {
    status: ProposalStatus
    passed: boolean
    reason: string
  } {
    const totalVotingPower =
      stats.voting_power_for +
      stats.voting_power_against +
      stats.voting_power_abstain

    if (totalVotingPower === 0) {
      return {
        status: ProposalStatus.REJECTED,
        passed: false,
        reason: 'No votes received',
      }
    }

    const participationRate = stats.total_votes / 100 // simplified, would use total eligible voters
    const forPercentage =
      (stats.voting_power_for / (stats.voting_power_for + stats.voting_power_against)) *
      100

    // Check minimum participation
    if (participationRate < GOVERNANCE_CONFIG.MIN_PARTICIPATION_PERCENTAGE) {
      return {
        status: ProposalStatus.REJECTED,
        passed: false,
        reason: 'Minimum participation not reached',
      }
    }

    // Check supermajority
    if (forPercentage >= GOVERNANCE_CONFIG.MIN_SUPERMAJORITY_PERCENTAGE) {
      return {
        status: ProposalStatus.PASSED,
        passed: true,
        reason: 'Supermajority reached',
      }
    }

    return {
      status: ProposalStatus.REJECTED,
      passed: false,
      reason: 'Insufficient support',
    }
  }

  /**
   * Get proposal lifecycle status
   */
  static getProposalLifecycle(proposal: Proposal): {
    current_phase: 'draft' | 'discussion' | 'voting' | 'implementation' | 'resolved'
    time_remaining_hours?: number
    voting_started: boolean
    voting_ended: boolean
  } {
    const now = new Date()
    const votingStart = new Date(proposal.voting_start_at)
    const votingEnd = new Date(proposal.voting_end_at)

    let current_phase: 'draft' | 'discussion' | 'voting' | 'implementation' | 'resolved'
    let voting_started = now >= votingStart
    let voting_ended = now >= votingEnd

    if (proposal.status === ProposalStatus.DRAFT) {
      current_phase = 'draft'
    } else if (proposal.status === ProposalStatus.ACTIVE) {
      current_phase = 'discussion'
    } else if (
      proposal.status === ProposalStatus.VOTING ||
      (voting_started && !voting_ended)
    ) {
      current_phase = 'voting'
    } else if (proposal.status === ProposalStatus.PASSED) {
      current_phase = 'implementation'
    } else {
      current_phase = 'resolved'
    }

    const timeRemaining =
      current_phase === 'voting' ? votingEnd.getTime() - now.getTime() : undefined
    const hours_remaining = timeRemaining ? Math.ceil(timeRemaining / (1000 * 60 * 60)) : undefined

    return {
      current_phase,
      time_remaining_hours: hours_remaining,
      voting_started,
      voting_ended,
    }
  }

  /**
   * Calculate governance participation score
   */
  static calculateParticipationScore(params: {
    total_votes: number
    votes_this_month: number
    proposals_created: number
    passed_proposals: number
  }): number {
    const voteScore = Math.min(params.total_votes / 100, 1) * 40 // max 40 points
    const monthlyScore = Math.min(params.votes_this_month / 10, 1) * 30 // max 30 points
    const creationScore = Math.min(params.proposals_created / 5, 1) * 20 // max 20 points
    const successScore =
      params.proposals_created > 0
        ? (params.passed_proposals / params.proposals_created) * 10
        : 0 // max 10 points

    return Math.round(voteScore + monthlyScore + creationScore + successScore)
  }

  /**
   * Get governance stats for dashboard
   */
  static getGovernanceStats(proposals: Proposal[], userProposalCount: number): {
    total_proposals: number
    active_proposals: number
    passed_proposals: number
    user_created_proposals: number
  } {
    const active = proposals.filter(
      (p) =>
        p.status === ProposalStatus.ACTIVE ||
        p.status === ProposalStatus.VOTING
    ).length

    const passed = proposals.filter(
      (p) => p.status === ProposalStatus.PASSED
    ).length

    return {
      total_proposals: proposals.length,
      active_proposals: active,
      passed_proposals: passed,
      user_created_proposals: userProposalCount,
    }
  }
}
