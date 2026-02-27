/**
 * Governance Service
 * Handles governance proposals and voting
 */

import { supabase } from '../../../lib/supabase'

export interface Proposal {
  id: string
  title: string
  description: string
  status: 'open' | 'closed' | 'passed' | 'failed'
  created_at: string
  votes_yes: number
  votes_no: number
}

class GovernanceService {
  async getProposals(): Promise<Proposal[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select('id, title, description, status, created_at, votes_yes, votes_no')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as Proposal[]
  }

  async vote(
    proposalId: string,
    userId: string,
    vote: 'yes' | 'no',
    weight: number = 1
  ): Promise<void> {
    // First check if user has already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('proposal_id', proposalId)
      .eq('user_id', userId)
      .single()

    if (existingVote) {
      throw new Error('You have already voted on this proposal')
    }

    // Record the vote
    const { error } = await supabase
      .from('votes')
      .insert({
        proposal_id: proposalId,
        user_id: userId,
        vote,
        weight,
      })

    if (error) throw new Error(error.message)

    // Update proposal vote counts
    const updateField = vote === 'yes' ? 'votes_yes' : 'votes_no'
    const { data: proposal } = await supabase
      .from('proposals')
      .select(updateField)
      .eq('id', proposalId)
      .single()

    if (proposal) {
      const currentVotes = (proposal as any)[updateField] || 0
      await supabase
        .from('proposals')
        .update({ [updateField]: currentVotes + weight })
        .eq('id', proposalId)
    }
  }
}

export const governanceService = new GovernanceService()
