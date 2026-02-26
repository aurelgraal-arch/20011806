/**
 * Governance and voting types
 * Defines proposal, voting, and governance structures
 */

export enum ProposalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  VOTING = 'voting',
  PASSED = 'passed',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  CANCELLED = 'cancelled',
}

export enum VoteOption {
  FOR = 'for',
  AGAINST = 'against',
  ABSTAIN = 'abstain',
}

export interface Proposal {
  id: string
  creator_id: string
  title: string
  description: string
  detailed_content: string
  status: ProposalStatus
  min_reputation_to_create: number
  voting_start_at: string
  voting_end_at: string
  created_at: string
  updated_at: string
}

export interface ProposalVote {
  id: string
  proposal_id: string
  user_id: string
  vote: VoteOption
  voting_power: number // reputation + governance weight
  created_at: string
}

export interface ProposalStats {
  proposal_id: string
  total_votes: number
  votes_for: number
  votes_against: number
  votes_abstain: number
  voting_power_for: number
  voting_power_against: number
  voting_power_abstain: number
  participation_rate: number
}

export interface UserGovernanceActivity {
  user_id: string
  total_votes: number
  proposals_created: number
  passed_proposals: number
  avg_voting_participation: number
  last_vote_at?: string
}
