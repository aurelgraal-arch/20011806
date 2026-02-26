import { supabase } from '../../../lib/supabaseClient'
import type { Proposal } from '../../types'

class GovernanceService {
  async getProposals(): Promise<Proposal[]> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async createProposal(proposal: Partial<Proposal>) {
    const { data, error } = await supabase
      .from('proposals')
      .insert([proposal])
      .select()
    if (error) throw error
    return data?.[0]
  }

  async vote(proposalId: string, userId: string, vote: string, weight: number) {
    const { data, error } = await supabase
      .from('proposal_votes')
      .insert([{ proposal_id: proposalId, user_id: userId, vote, weight }])
      .select()
    if (error) throw error
    return data?.[0]
  }

  subscribeProposals(callback: (proposal: Proposal) => void) {
    const ch = supabase
      .channel('proposals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals' },
        (payload: any) => {
          callback(payload.new as Proposal)
        }
      )
      .subscribe()
    return () => ch.unsubscribe()
  }
}

export const governanceService = new GovernanceService()
